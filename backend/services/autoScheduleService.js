/**
 * Service d'auto-planification pour générer des plannings hebdomadaires optimisés
 * pour tous les employés actifs d'un département
 */

const db = require("../db");
const moment = require("moment");

class AutoScheduleService {
  /**
   * Génère un planning hebdomadaire optimisé pour les employés actifs
   *
   * @param {Object} options Les options de génération du planning
   * @param {Date|string} options.weekStart Date de début de la semaine (lundi)
   * @param {number} options.departmentId ID du département concerné
   * @param {Object} options.businessHours Heures d'ouverture par jour {Monday: [9, 17], ...}
   * @param {Object} options.employeePreferences Préférences par employé (facultatif)
   * @param {string|Date} [options.sourceWeek] Date de début d'une semaine à cloner (facultatif)
   * @param {number} [options.minimumEmployees=1] Nombre minimum d'employés requis par créneau
   * @param {boolean} [options.balanceRoles=true] Équilibrer les rôles
   * @returns {Promise<Object>} Planning généré et statistiques
   */
  async generateWeeklySchedule(options) {
    try {
      // Valider les options
      if (!options.weekStart)
        throw new Error("Date de début de semaine requise");
      if (!options.departmentId) throw new Error("ID de département requis");
      if (!options.businessHours)
        throw new Error("Heures d'ouverture requises");

      const weekStart = moment(options.weekStart).startOf("isoWeek");
      const weekEnd = moment(weekStart).add(6, "days").endOf("day");

      // Paramètres par défaut
      const minimumEmployees = options.minimumEmployees || 1;
      const balanceRoles = options.balanceRoles !== false;

      // 1. Récupérer les employés actifs du département
      const employees = await this._getActiveEmployees(options.departmentId);
      if (!employees.length)
        throw new Error("Aucun employé actif trouvé dans ce département");

      // 2. Récupérer les congés approuvés pendant cette semaine
      const vacations = await this._getApprovedVacations(
        employees.map((e) => e.id),
        weekStart.format("YYYY-MM-DD"),
        weekEnd.format("YYYY-MM-DD")
      );

      // 3. Récupérer une semaine source si demandé
      let sourceSchedules = null;
      if (options.sourceWeek) {
        sourceSchedules = await this._getSourceWeekSchedules(
          options.departmentId,
          options.sourceWeek
        );
      }

      // 4. Générer le planning optimisé
      const result = await this._generateOptimizedSchedule({
        employees,
        weekStart,
        weekEnd,
        businessHours: options.businessHours,
        vacations,
        employeePreferences: options.employeePreferences || {},
        sourceSchedules,
        minimumEmployees,
        balanceRoles,
      });

      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      throw error;
    }
  }

  /**
   * Récupère les employés actifs d'un département
   *
   * @param {number} departmentId ID du département
   * @returns {Promise<Array>} Liste des employés actifs
   * @private
   */
  async _getActiveEmployees(departmentId) {
    try {
      const employees = await db.query(
        `SELECT id, first_name, last_name, role, contractHours,
                preferred_shifts, hour_balance
         FROM employees
         WHERE status = 'active' AND department_id = ?`,
        [departmentId]
      );

      return employees;
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  /**
   * Récupère les congés approuvés pour une période donnée
   *
   * @param {Array<number>} employeeIds IDs des employés concernés
   * @param {string} startDate Date de début (YYYY-MM-DD)
   * @param {string} endDate Date de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Liste des congés approuvés
   * @private
   */
  async _getApprovedVacations(employeeIds, startDate, endDate) {
    try {
      if (!employeeIds.length) return [];

      const vacations = await db.query(
        `SELECT employee_id, start_date, end_date, type
         FROM vacation_requests
         WHERE employee_id IN (?) AND status = 'approved'
         AND ((start_date BETWEEN ? AND ?) OR 
              (end_date BETWEEN ? AND ?) OR
              (start_date <= ? AND end_date >= ?))`,
        [
          employeeIds,
          startDate,
          endDate,
          startDate,
          endDate,
          startDate,
          endDate,
        ]
      );

      return vacations;
    } catch (error) {
      console.error("Erreur lors de la récupération des congés:", error);
      throw error;
    }
  }

  /**
   * Récupère les plannings d'une semaine source pour clonage
   *
   * @param {number} departmentId ID du département
   * @param {string|Date} sourceWeek Date de début de la semaine source
   * @returns {Promise<Array>} Liste des plannings de la semaine source
   * @private
   */
  async _getSourceWeekSchedules(departmentId, sourceWeek) {
    try {
      const sourceWeekStart = moment(sourceWeek)
        .startOf("isoWeek")
        .format("YYYY-MM-DD");

      const schedules = await db.query(
        `SELECT ws.employee_id, ws.schedule_data
         FROM weekly_schedules ws
         JOIN employees e ON ws.employee_id = e.id
         WHERE e.department_id = ? AND ws.week_start = ?`,
        [departmentId, sourceWeekStart]
      );

      return schedules;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la semaine source:",
        error
      );
      throw error;
    }
  }

  /**
   * Génère un planning optimisé en utilisant un algorithme heuristique
   *
   * @param {Object} params Paramètres de génération
   * @returns {Promise<Object>} Planning optimisé et statistiques
   * @private
   */
  async _generateOptimizedSchedule(params) {
    const {
      employees,
      weekStart,
      weekEnd,
      businessHours,
      vacations,
      employeePreferences,
      sourceSchedules,
      minimumEmployees,
      balanceRoles,
    } = params;

    // Créer une structure pour tracker les heures attribuées par employé
    const employeeHours = {};
    employees.forEach((emp) => {
      employeeHours[emp.id] = 0;
    });

    // Créer une map des jours de congés par employé
    const vacationDays = this._buildVacationDaysMap(vacations);

    // Jours de la semaine
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Initialiser le planning avec des tableaux vides pour chaque jour
    const scheduleData = {};
    days.forEach((day) => {
      scheduleData[day] = {};
      employees.forEach((emp) => {
        scheduleData[day][emp.id] = [];
      });
    });

    // Cloner le planning source si disponible
    if (sourceSchedules && sourceSchedules.length) {
      // Utiliser les données du planning source comme point de départ
      this._applySourceSchedule(
        scheduleData,
        sourceSchedules,
        employees,
        vacationDays
      );
    } else {
      // Générer un nouveau planning optimisé
      this._generateScheduleFromScratch(
        scheduleData,
        employees,
        businessHours,
        vacationDays,
        employeePreferences,
        employeeHours,
        minimumEmployees,
        balanceRoles
      );
    }

    // Optimiser le planning généré pour équilibrer les charges
    this._optimizeSchedule(
      scheduleData,
      employees,
      businessHours,
      vacationDays,
      employeePreferences,
      employeeHours,
      minimumEmployees
    );

    // Formatter le résultat final
    const result = this._formatScheduleResult(
      scheduleData,
      employees,
      weekStart,
      employeeHours
    );

    return result;
  }

  /**
   * Construit une map des jours de congés par employé
   *
   * @param {Array} vacations Liste des congés approuvés
   * @returns {Object} Map des jours de congés par employé
   * @private
   */
  _buildVacationDaysMap(vacations) {
    const vacationDays = {};

    vacations.forEach((vacation) => {
      const employeeId = vacation.employee_id;
      if (!vacationDays[employeeId]) {
        vacationDays[employeeId] = [];
      }

      const startDate = moment(vacation.start_date);
      const endDate = moment(vacation.end_date);

      // Ajouter chaque jour entre start_date et end_date
      let currentDate = startDate.clone();
      while (currentDate.isSameOrBefore(endDate)) {
        vacationDays[employeeId].push(currentDate.format("YYYY-MM-DD"));
        currentDate.add(1, "day");
      }
    });

    return vacationDays;
  }

  /**
   * Applique le planning source comme base
   *
   * @param {Object} scheduleData Planning en cours de génération
   * @param {Array} sourceSchedules Plannings sources
   * @param {Array} employees Liste des employés
   * @param {Object} vacationDays Map des jours de congés
   * @private
   */
  _applySourceSchedule(scheduleData, sourceSchedules, employees, vacationDays) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const activeEmployeeIds = employees.map((e) => e.id);

    // Pour chaque planning source
    sourceSchedules.forEach((source) => {
      const employeeId = source.employee_id;

      // Vérifier si l'employé est toujours actif
      if (!activeEmployeeIds.includes(employeeId)) return;

      // Vérifier si la structure schedule_data est valide
      const sourceData =
        typeof source.schedule_data === "string"
          ? JSON.parse(source.schedule_data)
          : source.schedule_data;

      if (!sourceData) return;

      // Copier les créneaux de chaque jour, sauf pour les jours de congés
      days.forEach((day) => {
        if (sourceData[day] && Array.isArray(sourceData[day])) {
          // Calculer la date correspondant à ce jour
          const weekStartMoment = moment().startOf("isoWeek");
          const dayIndex = days.indexOf(day);
          const dayDate = weekStartMoment
            .clone()
            .add(dayIndex, "days")
            .format("YYYY-MM-DD");

          // Vérifier si l'employé est en congé ce jour-là
          const isOnVacation =
            vacationDays[employeeId] &&
            vacationDays[employeeId].includes(dayDate);

          if (!isOnVacation) {
            scheduleData[day][employeeId] = [...sourceData[day]];
          }
        }
      });
    });
  }

  /**
   * Génère un planning à partir de zéro
   *
   * @param {Object} scheduleData Planning en cours de génération
   * @param {Array} employees Liste des employés
   * @param {Object} businessHours Heures d'ouverture par jour
   * @param {Object} vacationDays Map des jours de congés
   * @param {Object} employeePreferences Préférences des employés
   * @param {Object} employeeHours Compteur d'heures par employé
   * @param {number} minimumEmployees Nombre minimum d'employés par créneau
   * @param {boolean} balanceRoles Équilibrer les rôles
   * @private
   */
  _generateScheduleFromScratch(
    scheduleData,
    employees,
    businessHours,
    vacationDays,
    employeePreferences,
    employeeHours,
    minimumEmployees,
    balanceRoles
  ) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Map des rôles pour l'équilibrage
    const roleMap = {};
    if (balanceRoles) {
      employees.forEach((emp) => {
        if (emp.role) {
          if (!roleMap[emp.role]) {
            roleMap[emp.role] = [];
          }
          roleMap[emp.role].push(emp.id);
        }
      });
    }

    // Pour chaque jour de la semaine
    days.forEach((day) => {
      // Vérifier si le jour est ouvré
      if (
        !businessHours[day] ||
        !Array.isArray(businessHours[day]) ||
        businessHours[day].length < 2
      ) {
        return; // Jour non ouvré ou format incorrect
      }

      const [openHour, closeHour] = businessHours[day];
      if (openHour >= closeHour) return; // Heures invalides

      // Calculer la date pour ce jour
      const weekStartMoment = moment().startOf("isoWeek");
      const dayIndex = days.indexOf(day);
      const dayDate = weekStartMoment
        .clone()
        .add(dayIndex, "days")
        .format("YYYY-MM-DD");

      // Diviser la journée en créneaux (par défaut de 4 heures)
      const slots = [];
      for (let hour = openHour; hour < closeHour; hour += 4) {
        const slotEnd = Math.min(hour + 4, closeHour);
        slots.push({
          start: hour,
          end: slotEnd,
          hours: slotEnd - hour,
          employees: [],
        });
      }

      // Trier les employés par nombre d'heures travaillées (croissant)
      // Cela permet d'équilibrer les heures entre employés
      const sortedEmployees = [...employees].sort((a, b) => {
        return employeeHours[a.id] - employeeHours[b.id];
      });

      // Attribuer des employés à chaque créneau
      slots.forEach((slot) => {
        const availableEmployees = sortedEmployees.filter((emp) => {
          // Vérifier si l'employé n'est pas en congé ce jour-là
          const isOnVacation =
            vacationDays[emp.id] && vacationDays[emp.id].includes(dayDate);

          if (isOnVacation) return false;

          // Vérifier si l'attribution de ce créneau ne dépasserait pas le contrat
          const potentialHours = employeeHours[emp.id] + slot.hours;
          const maxHours = emp.contractHours || 35; // Par défaut 35h si non spécifié

          return potentialHours <= maxHours * 1.1; // Tolérance de 10% de dépassement
        });

        // Si équilibrage des rôles, s'assurer que chaque rôle est représenté
        if (balanceRoles && Object.keys(roleMap).length > 1) {
          const selectedEmployees = new Set();

          // D'abord, sélectionner un employé de chaque rôle si possible
          Object.entries(roleMap).forEach(([role, empIds]) => {
            const availableForRole = availableEmployees.filter(
              (emp) => emp.role === role && !selectedEmployees.has(emp.id)
            );

            if (availableForRole.length > 0) {
              // Prendre l'employé avec le moins d'heures
              const selected = availableForRole[0];
              selectedEmployees.add(selected.id);

              // Ajouter le créneau au planning
              scheduleData[day][selected.id].push({
                start: slot.start,
                end: slot.end,
              });

              // Mettre à jour le compteur d'heures
              employeeHours[selected.id] += slot.hours;
            }
          });

          // Ensuite, compléter avec d'autres employés si nécessaire
          if (selectedEmployees.size < minimumEmployees) {
            const remaining = availableEmployees.filter(
              (emp) => !selectedEmployees.has(emp.id)
            );

            for (
              let i = 0;
              i < minimumEmployees - selectedEmployees.size &&
              i < remaining.length;
              i++
            ) {
              const selected = remaining[i];
              selectedEmployees.add(selected.id);

              // Ajouter le créneau au planning
              scheduleData[day][selected.id].push({
                start: slot.start,
                end: slot.end,
              });

              // Mettre à jour le compteur d'heures
              employeeHours[selected.id] += slot.hours;
            }
          }
        } else {
          // Sans équilibrage des rôles, simplement prendre les premiers employés disponibles
          const toSelect = Math.min(
            minimumEmployees,
            availableEmployees.length
          );

          for (let i = 0; i < toSelect; i++) {
            const selected = availableEmployees[i];

            // Ajouter le créneau au planning
            scheduleData[day][selected.id].push({
              start: slot.start,
              end: slot.end,
            });

            // Mettre à jour le compteur d'heures
            employeeHours[selected.id] += slot.hours;
          }
        }
      });
    });
  }

  /**
   * Optimise le planning généré pour respecter au mieux les préférences
   *
   * @param {Object} scheduleData Planning en cours de génération
   * @param {Array} employees Liste des employés
   * @param {Object} businessHours Heures d'ouverture par jour
   * @param {Object} vacationDays Map des jours de congés
   * @param {Object} employeePreferences Préférences des employés
   * @param {Object} employeeHours Compteur d'heures par employé
   * @param {number} minimumEmployees Nombre minimum d'employés par créneau
   * @private
   */
  _optimizeSchedule(
    scheduleData,
    employees,
    businessHours,
    vacationDays,
    employeePreferences,
    employeeHours,
    minimumEmployees
  ) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const maxIterations = 100;
    let iteration = 0;
    let improved = true;

    // Calculer le score initial du planning
    let currentScore = this._evaluateSchedule(
      scheduleData,
      employees,
      businessHours,
      employeePreferences,
      employeeHours,
      minimumEmployees
    );

    // Algorithme de recherche locale pour améliorer le planning
    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      // Pour chaque jour
      for (const day of days) {
        // Vérifier si le jour est ouvré
        if (
          !businessHours[day] ||
          !Array.isArray(businessHours[day]) ||
          businessHours[day].length < 2
        ) {
          continue;
        }

        // Calculer la date pour ce jour
        const weekStartMoment = moment().startOf("isoWeek");
        const dayIndex = days.indexOf(day);
        const dayDate = weekStartMoment
          .clone()
          .add(dayIndex, "days")
          .format("YYYY-MM-DD");

        // Pour chaque paire d'employés, essayer d'échanger leurs créneaux
        for (let i = 0; i < employees.length; i++) {
          const empA = employees[i];

          // Vérifier si l'employé A est en congé ce jour-là
          const isAOnVacation =
            vacationDays[empA.id] && vacationDays[empA.id].includes(dayDate);
          if (isAOnVacation) continue;

          for (let j = i + 1; j < employees.length; j++) {
            const empB = employees[j];

            // Vérifier si l'employé B est en congé ce jour-là
            const isBOnVacation =
              vacationDays[empB.id] && vacationDays[empB.id].includes(dayDate);
            if (isBOnVacation) continue;

            // Échanger temporairement les créneaux
            const slotsA = scheduleData[day][empA.id];
            const slotsB = scheduleData[day][empB.id];

            scheduleData[day][empA.id] = slotsB;
            scheduleData[day][empB.id] = slotsA;

            // Recalculer les heures
            const originalHoursA = employeeHours[empA.id];
            const originalHoursB = employeeHours[empB.id];

            const hoursA = slotsA.reduce(
              (sum, slot) => sum + (slot.end - slot.start),
              0
            );
            const hoursB = slotsB.reduce(
              (sum, slot) => sum + (slot.end - slot.start),
              0
            );

            employeeHours[empA.id] = originalHoursA - hoursA + hoursB;
            employeeHours[empB.id] = originalHoursB - hoursB + hoursA;

            // Évaluer le nouveau planning
            const newScore = this._evaluateSchedule(
              scheduleData,
              employees,
              businessHours,
              employeePreferences,
              employeeHours,
              minimumEmployees
            );

            // Si le nouveau score est meilleur, conserver l'échange
            if (newScore > currentScore) {
              currentScore = newScore;
              improved = true;
            } else {
              // Sinon, annuler l'échange
              scheduleData[day][empA.id] = slotsA;
              scheduleData[day][empB.id] = slotsB;
              employeeHours[empA.id] = originalHoursA;
              employeeHours[empB.id] = originalHoursB;
            }
          }
        }
      }
    }
  }

  /**
   * Évalue la qualité d'un planning selon plusieurs critères
   *
   * @param {Object} scheduleData Planning à évaluer
   * @param {Array} employees Liste des employés
   * @param {Object} businessHours Heures d'ouverture par jour
   * @param {Object} employeePreferences Préférences des employés
   * @param {Object} employeeHours Compteur d'heures par employé
   * @param {number} minimumEmployees Nombre minimum d'employés par créneau
   * @returns {number} Score d'évaluation (plus élevé = meilleur)
   * @private
   */
  _evaluateSchedule(
    scheduleData,
    employees,
    businessHours,
    employeePreferences,
    employeeHours,
    minimumEmployees
  ) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let score = 100; // Score de base

    // Évaluer l'équilibre des heures entre employés
    const targetHoursPerEmployee = {};
    employees.forEach((emp) => {
      targetHoursPerEmployee[emp.id] = emp.contractHours || 35;
    });

    // Pénaliser les écarts par rapport aux heures contractuelles
    Object.entries(employeeHours).forEach(([empId, hours]) => {
      const target = targetHoursPerEmployee[empId];
      const diff = Math.abs(hours - target);

      if (hours > target) {
        // Pénaliser davantage les heures supplémentaires
        score -= diff * 2;
      } else {
        // Pénaliser légèrement les heures manquantes
        score -= diff;
      }
    });

    // Évaluer le respect des préférences
    let preferencesMatched = 0;
    let totalPreferences = 0;

    if (employeePreferences) {
      Object.entries(employeePreferences).forEach(([empId, prefs]) => {
        empId = parseInt(empId);

        if (!prefs || typeof prefs !== "object") return;

        days.forEach((day) => {
          if (!prefs[day] || !Array.isArray(prefs[day])) return;

          const preferredSlots = prefs[day];
          const assignedSlots = scheduleData[day][empId] || [];

          preferredSlots.forEach((preferred) => {
            totalPreferences++;

            // Vérifier si un des créneaux attribués correspond à la préférence
            const isMatched = assignedSlots.some((assigned) => {
              return (
                assigned.start <= preferred.start &&
                assigned.end >= preferred.end
              );
            });

            if (isMatched) {
              preferencesMatched++;
            }
          });
        });
      });
    }

    // Bonus pour le respect des préférences
    if (totalPreferences > 0) {
      const preferenceMatchRate = preferencesMatched / totalPreferences;
      score += preferenceMatchRate * 50; // Max 50 points de bonus
    }

    // Évaluer la couverture des créneaux
    days.forEach((day) => {
      if (
        !businessHours[day] ||
        !Array.isArray(businessHours[day]) ||
        businessHours[day].length < 2
      ) {
        return;
      }

      const [openHour, closeHour] = businessHours[day];
      if (openHour >= closeHour) return;

      // Diviser la journée en créneaux horaires
      for (let hour = openHour; hour < closeHour; hour++) {
        // Compter combien d'employés sont présents à cette heure
        let employeesPresent = 0;

        employees.forEach((emp) => {
          const slots = scheduleData[day][emp.id] || [];
          const isPresent = slots.some((slot) => {
            return slot.start <= hour && slot.end > hour;
          });

          if (isPresent) {
            employeesPresent++;
          }
        });

        // Pénaliser si le nombre minimum d'employés n'est pas atteint
        if (employeesPresent < minimumEmployees) {
          score -= 5 * (minimumEmployees - employeesPresent);
        }
      }
    });

    return score;
  }

  /**
   * Formate le résultat final du planning généré
   *
   * @param {Object} scheduleData Planning généré
   * @param {Array} employees Liste des employés
   * @param {moment.Moment} weekStart Date de début de la semaine
   * @param {Object} employeeHours Heures attribuées par employé
   * @returns {Object} Résultat formaté avec planning et statistiques
   * @private
   */
  _formatScheduleResult(scheduleData, employees, weekStart, employeeHours) {
    const result = {
      schedule: [],
      stats: {
        total_hours: { ...employeeHours },
        preference_match_rate: 0, // Sera calculé par l'interface utilisateur
        overworked_employees: [],
      },
    };

    // Identifier les employés en surcharge
    employees.forEach((emp) => {
      const contractHours = emp.contractHours || 35;
      if (employeeHours[emp.id] > contractHours) {
        result.stats.overworked_employees.push({
          employee_id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          contract_hours: contractHours,
          assigned_hours: employeeHours[emp.id],
          difference: employeeHours[emp.id] - contractHours,
        });
      }
    });

    // Formater le planning pour chaque employé
    employees.forEach((emp) => {
      const employeeSchedule = {
        employee_id: emp.id,
        week_start: weekStart.format("YYYY-MM-DD"),
        schedule_data: {},
        status: "draft",
      };

      // Ajouter les créneaux de chaque jour
      Object.entries(scheduleData).forEach(([day, dayData]) => {
        employeeSchedule.schedule_data[day] = dayData[emp.id] || [];
      });

      result.schedule.push(employeeSchedule);
    });

    return result;
  }
}

module.exports = AutoScheduleService;
