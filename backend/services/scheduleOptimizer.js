/**
 * Service d'optimisation de planning
 * Utilise des algorithmes d'optimisation pour générer des plannings
 * en fonction des contraintes définies
 */

const db = require("../config/db");
const {
  formatDateForMySQL,
  getWeekDates,
  formatDateYYYYMMDD,
} = require("../utils/dateUtils");

/**
 * Classe principale pour l'optimisation des plannings
 */
class ScheduleOptimizer {
  /**
   * Générer un planning optimisé pour une semaine
   * @param {Object} constraints - Contraintes pour la génération
   * @returns {Object} Planning optimisé
   */
  async generateOptimizedSchedule(constraints) {
    try {
      const {
        weekStart,
        openingHours,
        employees,
        minHoursPerEmployee,
        maxHoursPerEmployee,
        departmentId,
        priorityRules,
        existingCommitments,
      } = constraints;

      console.log(
        "Génération de planning optimisé avec les contraintes:",
        JSON.stringify({
          weekStart,
          openingHours,
          employeeCount: employees?.length || "Non spécifié",
          minHoursPerEmployee,
          maxHoursPerEmployee,
          departmentId,
          priorityRules: priorityRules?.length || "Non spécifiées",
          existingCommitments: existingCommitments?.length || "Non spécifiés",
        })
      );

      // Récupérer les informations des employés si non fournies
      const targetEmployees =
        employees || (await this.getAvailableEmployees(departmentId));

      // Récupérer les horaires d'ouverture par défaut si non fournis
      const workingHours =
        openingHours || (await this.getDefaultOpeningHours(departmentId));

      // Récupérer les engagements existants (congés, formations, etc.)
      const commitments =
        existingCommitments ||
        (await this.getExistingCommitments(
          weekStart,
          targetEmployees.map((e) => e.id)
        ));

      // Générer le planning initial
      const initialSchedule = this.createInitialSchedule(
        weekStart,
        targetEmployees,
        workingHours,
        commitments,
        minHoursPerEmployee || 0,
        maxHoursPerEmployee || 40
      );

      // Optimiser le planning avec l'algorithme de recherche locale
      const optimizedSchedule = this.optimizeSchedule(
        initialSchedule,
        workingHours,
        priorityRules || [],
        minHoursPerEmployee || 0,
        maxHoursPerEmployee || 40
      );

      // Calculer les statistiques du planning
      const scheduleStats = this.calculateScheduleStats(optimizedSchedule);

      return {
        success: true,
        schedule: optimizedSchedule,
        stats: scheduleStats,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la génération du planning optimisé:",
        error
      );
      return {
        success: false,
        message: "Erreur lors de la génération du planning",
        error: error.message,
      };
    }
  }

  /**
   * Récupérer les employés disponibles pour un département
   * @param {number} departmentId - ID du département
   * @returns {Array} Liste des employés disponibles
   */
  async getAvailableEmployees(departmentId) {
    try {
      let query = "SELECT * FROM employees WHERE status = 'active'";

      if (departmentId) {
        query += " AND department_id = ?";
        const [employees] = await db.query(query, [departmentId]);
        return employees;
      } else {
        const [employees] = await db.query(query);
        return employees;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  /**
   * Récupérer les horaires d'ouverture par défaut
   * @param {number} departmentId - ID du département
   * @returns {Object} Horaires d'ouverture par défaut
   */
  async getDefaultOpeningHours(departmentId) {
    // Par défaut: ouvert de 9h à 18h du lundi au vendredi
    const defaultHours = {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    };

    // Si un departmentId est fourni, essayer de récupérer les horaires spécifiques
    if (departmentId) {
      try {
        const [departmentSettings] = await db.query(
          "SELECT working_hours FROM departments WHERE id = ?",
          [departmentId]
        );

        if (
          departmentSettings.length > 0 &&
          departmentSettings[0].working_hours
        ) {
          return JSON.parse(departmentSettings[0].working_hours);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des horaires d'ouverture:",
          error
        );
      }
    }

    return defaultHours;
  }

  /**
   * Récupérer les engagements existants (congés, formations, etc.)
   * @param {string} weekStart - Date de début de semaine
   * @param {Array} employeeIds - Liste des IDs des employés
   * @returns {Array} Liste des engagements
   */
  async getExistingCommitments(weekStart, employeeIds) {
    try {
      const formattedWeekStart = formatDateForMySQL(weekStart);

      // Calculer la date de fin de semaine (7 jours après le début)
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const formattedWeekEnd = formatDateForMySQL(weekEndDate);

      // Récupérer les congés pour la période
      const [vacations] = await db.query(
        `
        SELECT employee_id, start_date, end_date, type, status 
        FROM vacations 
        WHERE 
          employee_id IN (?) AND 
          ((start_date BETWEEN ? AND ?) OR 
           (end_date BETWEEN ? AND ?) OR 
           (start_date <= ? AND end_date >= ?)) AND
          status = 'approved'
      `,
        [
          employeeIds,
          formattedWeekStart,
          formattedWeekEnd,
          formattedWeekStart,
          formattedWeekEnd,
          formattedWeekStart,
          formattedWeekEnd,
        ]
      );

      return vacations.map((vacation) => ({
        type: "vacation",
        employeeId: vacation.employee_id,
        startDate: formatDateYYYYMMDD(vacation.start_date),
        endDate: formatDateYYYYMMDD(vacation.end_date),
        vacationType: vacation.type,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des engagements:", error);
      return [];
    }
  }

  /**
   * Créer un planning initial basé sur les contraintes
   * @param {string} weekStart - Date de début de semaine
   * @param {Array} employees - Liste des employés
   * @param {Object} workingHours - Horaires d'ouverture
   * @param {Array} commitments - Engagements existants
   * @param {number} minHours - Nombre minimum d'heures par employé
   * @param {number} maxHours - Nombre maximum d'heures par employé
   * @returns {Object} Planning initial
   */
  createInitialSchedule(
    weekStart,
    employees,
    workingHours,
    commitments,
    minHours,
    maxHours
  ) {
    const weekDates = getWeekDates(weekStart);
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Initialiser le planning vide
    const schedule = {
      weekStart: formatDateYYYYMMDD(weekStart),
      weekEnd: formatDateYYYYMMDD(weekDates[6]),
      employeeSchedules: [],
    };

    // Pour chaque employé, créer un planning initial
    for (const employee of employees) {
      const employeeSchedule = {
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        shifts: [],
        totalHours: 0,
      };

      // Assigner des créneaux horaires initiaux pour chaque jour
      for (let i = 0; i < 7; i++) {
        const dayOfWeek = daysOfWeek[i];
        const date = formatDateYYYYMMDD(weekDates[i]);

        // Vérifier si l'employé a un engagement ce jour-là
        const hasCommitment = commitments.some((c) => {
          const commitmentStart = new Date(c.startDate);
          const commitmentEnd = new Date(c.endDate);
          const currentDate = new Date(date);
          return (
            c.employeeId === employee.id &&
            currentDate >= commitmentStart &&
            currentDate <= commitmentEnd
          );
        });

        // Si pas d'horaires d'ouverture ou jour d'engagement, pas de shift
        if (!workingHours[dayOfWeek].start || hasCommitment) {
          continue;
        }

        // Ajouter un shift uniquement si l'employé n'a pas dépassé ses heures max
        if (employeeSchedule.totalHours < maxHours) {
          const shiftDuration = this.calculateShiftDuration(
            workingHours[dayOfWeek].start,
            workingHours[dayOfWeek].end
          );

          // Si l'ajout de ce shift ne dépasse pas les heures max
          if (employeeSchedule.totalHours + shiftDuration <= maxHours) {
            employeeSchedule.shifts.push({
              date,
              start: workingHours[dayOfWeek].start,
              end: workingHours[dayOfWeek].end,
              duration: shiftDuration,
            });

            employeeSchedule.totalHours += shiftDuration;
          }
        }
      }

      schedule.employeeSchedules.push(employeeSchedule);
    }

    return schedule;
  }

  /**
   * Calculer la durée d'un shift en heures
   * @param {string} start - Heure de début (HH:MM)
   * @param {string} end - Heure de fin (HH:MM)
   * @returns {number} Durée en heures
   */
  calculateShiftDuration(start, end) {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return (endTotalMinutes - startTotalMinutes) / 60;
  }

  /**
   * Optimiser le planning avec l'algorithme de recherche locale
   * @param {Object} initialSchedule - Planning initial
   * @param {Object} workingHours - Horaires d'ouverture
   * @param {Array} priorityRules - Règles de priorité
   * @param {number} minHours - Nombre minimum d'heures par employé
   * @param {number} maxHours - Nombre maximum d'heures par employé
   * @returns {Object} Planning optimisé
   */
  optimizeSchedule(
    initialSchedule,
    workingHours,
    priorityRules,
    minHours,
    maxHours
  ) {
    // Copie profonde du planning initial
    const optimizedSchedule = JSON.parse(JSON.stringify(initialSchedule));
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Appliquer l'algorithme d'optimisation (recherche locale)
    // Nombre maximal d'itérations
    const maxIterations = 100;
    let currentIteration = 0;
    let currentScore = this.evaluateSchedule(
      optimizedSchedule,
      priorityRules,
      minHours,
      maxHours
    );

    while (currentIteration < maxIterations) {
      let improved = false;

      // Essayer différentes modifications et garder celle qui améliore le score
      for (
        let employeeIndex = 0;
        employeeIndex < optimizedSchedule.employeeSchedules.length;
        employeeIndex++
      ) {
        const employeeSchedule =
          optimizedSchedule.employeeSchedules[employeeIndex];

        // 1. Essayer d'ajouter un shift à un employé qui n'a pas assez d'heures
        if (employeeSchedule.totalHours < minHours) {
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dayOfWeek = daysOfWeek[dayIndex];
            const date = getWeekDates(initialSchedule.weekStart)[dayIndex];
            const formattedDate = formatDateYYYYMMDD(date);

            // Vérifier si l'employé a déjà un shift ce jour-là
            const hasShift = employeeSchedule.shifts.some(
              (s) => s.date === formattedDate
            );

            if (!hasShift && workingHours[dayOfWeek].start) {
              const shiftDuration = this.calculateShiftDuration(
                workingHours[dayOfWeek].start,
                workingHours[dayOfWeek].end
              );

              // Si l'ajout de ce shift ne dépasse pas les heures max
              if (employeeSchedule.totalHours + shiftDuration <= maxHours) {
                // Ajouter temporairement le shift
                employeeSchedule.shifts.push({
                  date: formattedDate,
                  start: workingHours[dayOfWeek].start,
                  end: workingHours[dayOfWeek].end,
                  duration: shiftDuration,
                });

                employeeSchedule.totalHours += shiftDuration;

                // Évaluer le nouveau planning
                const newScore = this.evaluateSchedule(
                  optimizedSchedule,
                  priorityRules,
                  minHours,
                  maxHours
                );

                if (newScore > currentScore) {
                  // Garder la modification
                  currentScore = newScore;
                  improved = true;
                } else {
                  // Annuler la modification
                  employeeSchedule.shifts.pop();
                  employeeSchedule.totalHours -= shiftDuration;
                }
              }
            }
          }
        }

        // 2. Essayer de supprimer un shift à un employé qui a trop d'heures
        if (
          employeeSchedule.totalHours > maxHours &&
          employeeSchedule.shifts.length > 0
        ) {
          // Supprimer temporairement un shift aléatoire
          const randomShiftIndex = Math.floor(
            Math.random() * employeeSchedule.shifts.length
          );
          const removedShift = employeeSchedule.shifts.splice(
            randomShiftIndex,
            1
          )[0];
          employeeSchedule.totalHours -= removedShift.duration;

          // Évaluer le nouveau planning
          const newScore = this.evaluateSchedule(
            optimizedSchedule,
            priorityRules,
            minHours,
            maxHours
          );

          if (newScore > currentScore) {
            // Garder la modification
            currentScore = newScore;
            improved = true;
          } else {
            // Annuler la modification
            employeeSchedule.shifts.splice(randomShiftIndex, 0, removedShift);
            employeeSchedule.totalHours += removedShift.duration;
          }
        }
      }

      // Si aucune amélioration n'a été trouvée, arrêter l'optimisation
      if (!improved) {
        break;
      }

      currentIteration++;
    }

    return optimizedSchedule;
  }

  /**
   * Évaluer la qualité d'un planning
   * @param {Object} schedule - Planning à évaluer
   * @param {Array} priorityRules - Règles de priorité
   * @param {number} minHours - Nombre minimum d'heures par employé
   * @param {number} maxHours - Nombre maximum d'heures par employé
   * @returns {number} Score du planning (plus élevé = meilleur)
   */
  evaluateSchedule(schedule, priorityRules, minHours, maxHours) {
    let score = 0;

    // Vérifier que chaque employé a entre minHours et maxHours
    for (const employeeSchedule of schedule.employeeSchedules) {
      // Pénaliser si l'employé a moins d'heures que le minimum
      if (employeeSchedule.totalHours < minHours) {
        score -= (minHours - employeeSchedule.totalHours) * 10;
      }

      // Pénaliser si l'employé a plus d'heures que le maximum
      if (employeeSchedule.totalHours > maxHours) {
        score -= (employeeSchedule.totalHours - maxHours) * 20;
      }

      // Bonus pour un nombre d'heures optimal
      const optimalHours = (minHours + maxHours) / 2;
      const distanceFromOptimal = Math.abs(
        employeeSchedule.totalHours - optimalHours
      );
      score += 10 - distanceFromOptimal;

      // Vérifier que les employés ont des jours de repos consécutifs
      const workDays = employeeSchedule.shifts.map((s) =>
        new Date(s.date).getDay()
      );
      const consecutiveWorkDays = this.findConsecutiveNumbers(workDays.sort());

      if (consecutiveWorkDays > 5) {
        score -= (consecutiveWorkDays - 5) * 5;
      }
    }

    // Appliquer les règles de priorité spécifiques
    for (const rule of priorityRules) {
      switch (rule.type) {
        case "preferred_days_off":
          score += this.applyPreferredDaysOffRule(schedule, rule);
          break;
        case "even_distribution":
          score += this.applyEvenDistributionRule(schedule);
          break;
        // Autres règles à implémenter selon les besoins
        default:
          console.warn(`Règle de priorité non reconnue: ${rule.type}`);
          break;
      }
    }

    return score;
  }

  /**
   * Trouver le nombre maximum de chiffres consécutifs dans un tableau
   * @param {Array} numbers - Tableau de nombres
   * @returns {number} Nombre maximum de chiffres consécutifs
   */
  findConsecutiveNumbers(numbers) {
    if (numbers.length === 0) return 0;

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === numbers[i - 1] + 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  /**
   * Appliquer la règle des jours de repos préférés
   * @param {Object} schedule - Planning à évaluer
   * @param {Object} rule - Règle de priorité
   * @returns {number} Score de la règle
   */
  applyPreferredDaysOffRule(schedule, rule) {
    let score = 0;

    for (const employeeSchedule of schedule.employeeSchedules) {
      if (employeeSchedule.employeeId === rule.employeeId) {
        const workDays = employeeSchedule.shifts.map((s) =>
          new Date(s.date).getDay()
        );

        // Bonus si l'employé ne travaille pas les jours préférés
        for (const preferredDayOff of rule.preferredDaysOff) {
          if (!workDays.includes(preferredDayOff)) {
            score += 5;
          }
        }
      }
    }

    return score;
  }

  /**
   * Appliquer la règle de distribution équitable des heures
   * @param {Object} schedule - Planning à évaluer
   * @returns {number} Score de la règle
   */
  applyEvenDistributionRule(schedule) {
    // Calculer l'écart-type des heures totales
    const totalHours = schedule.employeeSchedules.map((es) => es.totalHours);
    const mean = totalHours.reduce((a, b) => a + b, 0) / totalHours.length;
    const squaredDifferences = totalHours.map((h) => Math.pow(h - mean, 2));
    const variance =
      squaredDifferences.reduce((a, b) => a + b, 0) / totalHours.length;
    const stdDev = Math.sqrt(variance);

    // Plus l'écart-type est faible, plus la distribution est équitable
    return 10 - Math.min(stdDev, 10);
  }

  /**
   * Calculer les statistiques d'un planning
   * @param {Object} schedule - Planning à analyser
   * @returns {Object} Statistiques du planning
   */
  calculateScheduleStats(schedule) {
    const totalEmployees = schedule.employeeSchedules.length;
    let totalHours = 0;
    let minEmployeeHours = Infinity;
    let maxEmployeeHours = 0;
    let totalShifts = 0;

    for (const employeeSchedule of schedule.employeeSchedules) {
      totalHours += employeeSchedule.totalHours;
      minEmployeeHours = Math.min(
        minEmployeeHours,
        employeeSchedule.totalHours
      );
      maxEmployeeHours = Math.max(
        maxEmployeeHours,
        employeeSchedule.totalHours
      );
      totalShifts += employeeSchedule.shifts.length;
    }

    const avgHoursPerEmployee =
      totalEmployees > 0 ? totalHours / totalEmployees : 0;
    const avgShiftsPerEmployee =
      totalEmployees > 0 ? totalShifts / totalEmployees : 0;

    return {
      totalEmployees,
      totalHours,
      totalShifts,
      avgHoursPerEmployee,
      avgShiftsPerEmployee,
      minEmployeeHours: minEmployeeHours === Infinity ? 0 : minEmployeeHours,
      maxEmployeeHours,
    };
  }
}

module.exports = new ScheduleOptimizer();
