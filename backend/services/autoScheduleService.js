/**
 * Service d'auto-planification pour générer des plannings hebdomadaires optimisés
 * pour tous les employés actifs d'un département
 * @module services/autoScheduleService
 */

const db = require("../db");
const moment = require("moment");
const { optimizeSchedule } = require("../utils/scheduleOptimization");

/**
 * Classe de service pour la génération automatique de plannings.
 * Implémente une approche heuristique multi-phases pour créer des plannings optimisés.
 */
class AutoScheduleService {
  /**
   * Génère un planning hebdomadaire optimisé pour les employés actifs
   *
   * @param {Object} options Les options de génération du planning
   * @param {Date|string} options.weekStart Date de début de la semaine (lundi)
   * @param {number} options.departmentId ID du département concerné
   * @param {Object} options.businessHours Heures d'ouverture par jour {Monday: [9, 17], ...}
   * @param {Object} [options.employeePreferences] Préférences par employé (facultatif)
   * @param {string|Date} [options.sourceWeek] Date de début d'une semaine à cloner (facultatif)
   * @param {number} [options.minimumEmployees=1] Nombre minimum d'employés requis par créneau
   * @param {boolean} [options.balanceRoles=true] Équilibrer les rôles
   * @returns {Promise<Object>} Planning généré et statistiques
   */
  async generateWeeklySchedule(options) {
    try {
      console.log("Démarrage de la génération du planning hebdomadaire...");

      // Convertir la date de début en objet moment et calculer la fin de semaine
      const weekStart = moment(options.weekStart).startOf("isoWeek");
      const weekEnd = moment(weekStart).add(6, "days").endOf("day");

      // Paramètres par défaut
      const minimumEmployees = options.minimumEmployees || 1;
      const balanceRoles = options.balanceRoles !== false;

      // 1. Récupérer les employés actifs du département
      const employees = await this._getActiveEmployees(options.departmentId);
      if (!employees.length) {
        throw new Error("Aucun employé actif trouvé dans ce département");
      }
      console.log(
        `${employees.length} employés actifs trouvés dans ce département`
      );

      // 2. Récupérer les congés approuvés pendant cette semaine
      const vacations = await this._getApprovedVacations(
        employees.map((e) => e.id),
        weekStart.format("YYYY-MM-DD"),
        weekEnd.format("YYYY-MM-DD")
      );
      console.log(
        `${vacations.length} congés approuvés trouvés pour cette période`
      );

      // 3. Construire la map des jours de congés
      const vacationDays = this._buildVacationDaysMap(vacations);

      // 4. Récupérer une semaine source si demandé
      let sourceSchedules = null;
      if (options.sourceWeek) {
        sourceSchedules = await this._getSourceWeekSchedules(
          options.departmentId,
          options.sourceWeek
        );
        console.log(
          `${
            sourceSchedules ? sourceSchedules.length : 0
          } plannings sources trouvés`
        );
      }

      // 5. Générer le planning optimisé avec le nouvel algorithme
      let scheduleResult;

      if (sourceSchedules && sourceSchedules.length) {
        // Si une semaine source est fournie, l'utiliser comme point de départ
        console.log("Génération basée sur une semaine source...");
        scheduleResult = this._generateFromSourceSchedule(
          employees,
          weekStart,
          options.businessHours,
          vacationDays,
          options.employeePreferences || {},
          sourceSchedules,
          minimumEmployees,
          balanceRoles
        );
      } else {
        // Utiliser le nouvel algorithme d'optimisation amélioré
        console.log("Génération d'un nouveau planning optimisé...");
        scheduleResult = optimizeSchedule({
          employees,
          businessHours: options.businessHours,
          vacationDays,
          employeePreferences: options.employeePreferences || {},
          minimumEmployees,
          balanceRoles,
          weekStart: weekStart.format("YYYY-MM-DD"),
        });
      }

      // 6. Formatter le résultat final
      const result = this._formatScheduleResult(
        scheduleResult.scheduleData,
        employees,
        weekStart,
        scheduleResult.employeeHours,
        scheduleResult.metrics
      );

      console.log("Génération du planning terminée avec succès");
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
   * Génère un planning basé sur une semaine source
   *
   * @param {Array} employees Liste des employés
   * @param {moment.Moment} weekStart Date de début de la semaine
   * @param {Object} businessHours Heures d'ouverture par jour
   * @param {Object} vacationDays Map des jours de congés
   * @param {Object} employeePreferences Préférences des employés
   * @param {Array} sourceSchedules Plannings sources
   * @param {number} minimumEmployees Nombre minimum d'employés par créneau
   * @param {boolean} balanceRoles Équilibrer les rôles
   * @returns {Object} Planning généré
   * @private
   */
  _generateFromSourceSchedule(
    employees,
    weekStart,
    businessHours,
    vacationDays,
    employeePreferences,
    sourceSchedules,
    minimumEmployees,
    balanceRoles
  ) {
    console.log("Génération à partir d'une semaine source...");

    // Initialiser les structures de données
    const scheduleData = {};
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    days.forEach((day) => {
      scheduleData[day] = {};
      employees.forEach((emp) => {
        scheduleData[day][emp.id] = [];
      });
    });

    // Compteur d'heures par employé
    const employeeHours = {};
    employees.forEach((emp) => {
      employeeHours[emp.id] = 0;
    });

    // Appliquer les plannings sources
    this._applySourceSchedule(
      scheduleData,
      sourceSchedules,
      employees,
      vacationDays,
      employeeHours,
      weekStart
    );

    // Utiliser l'algorithme d'optimisation pour améliorer le planning basé sur la source
    const optimizationResult = optimizeSchedule({
      employees,
      businessHours,
      vacationDays,
      employeePreferences,
      minimumEmployees,
      balanceRoles,
      weekStart: weekStart.format("YYYY-MM-DD"),
      initialSchedule: scheduleData, // Fournir le planning basé sur la source
      initialHours: employeeHours, // Fournir les heures déjà attribuées
    });

    return optimizationResult;
  }

  /**
   * Applique les plannings sources aux données de planning
   *
   * @param {Object} scheduleData Données de planning à remplir
   * @param {Array} sourceSchedules Plannings sources
   * @param {Array} employees Liste des employés
   * @param {Object} vacationDays Map des jours de congés
   * @param {Object} employeeHours Compteur d'heures
   * @param {moment.Moment} weekStart Date de début de la semaine
   * @private
   */
  _applySourceSchedule(
    scheduleData,
    sourceSchedules,
    employees,
    vacationDays,
    employeeHours,
    weekStart
  ) {
    // Map des employés pour accès rapide
    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[emp.id] = emp;
    });

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

    // Dates de la semaine pour vérifier les congés
    const weekDates = {};
    days.forEach((day, index) => {
      weekDates[day] = weekStart
        .clone()
        .add(index, "days")
        .format("YYYY-MM-DD");
    });

    // Pour chaque planning source
    sourceSchedules.forEach((source) => {
      const employeeId = source.employee_id;

      // Vérifier si l'employé existe encore dans le département
      if (!employeeMap[employeeId]) return;

      // Récupérer les données de planning
      let sourceData;
      try {
        sourceData =
          typeof source.schedule_data === "string"
            ? JSON.parse(source.schedule_data)
            : source.schedule_data;
      } catch (e) {
        console.warn(
          `Erreur lors du parsing des données source pour l'employé ${employeeId}:`,
          e
        );
        return;
      }

      // Pour chaque jour de la semaine
      days.forEach((day) => {
        if (!sourceData[day]) return;

        // Vérifier si l'employé est en congé ce jour-là
        const isOnVacation =
          vacationDays[employeeId] &&
          vacationDays[employeeId].includes(weekDates[day]);

        if (isOnVacation) return;

        // Ajouter les shifts du jour
        sourceData[day].forEach((shift) => {
          if (!shift.start || !shift.end) return;

          // Calculer la durée
          const duration = shift.end - shift.start;

          // Ajouter le shift
          scheduleData[day][employeeId].push({
            start: shift.start,
            end: shift.end,
            duration,
            source: true, // Marquer comme provenant d'une source
          });

          // Mettre à jour le compteur d'heures
          employeeHours[employeeId] += duration;
        });
      });
    });
  }

  /**
   * Formate le résultat final pour correspondre à la structure attendue par l'API
   *
   * @param {Object} scheduleData Données de planning générées
   * @param {Array} employees Liste des employés
   * @param {moment.Moment} weekStart Date de début de la semaine
   * @param {Object} employeeHours Compteur d'heures par employé
   * @param {Object} metrics Métriques du planning
   * @returns {Object} Résultat formaté
   * @private
   */
  _formatScheduleResult(
    scheduleData,
    employees,
    weekStart,
    employeeHours,
    metrics
  ) {
    // Convertir le format de scheduleData en format attendu par l'API
    const formattedSchedule = [];
    const weekStartStr = weekStart.format("YYYY-MM-DD");

    // Map des employés pour accès rapide
    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[emp.id] = emp;
    });

    // Pour chaque employé
    employees.forEach((emp) => {
      // Formater les données de schedule pour cet employé
      const schedule_data = {};

      // Pour chaque jour
      Object.keys(scheduleData).forEach((day) => {
        if (!scheduleData[day][emp.id]) return;

        // Ajouter les shifts de ce jour
        schedule_data[day] = scheduleData[day][emp.id].map((shift) => ({
          start: shift.start,
          end: shift.end,
        }));
      });

      // Ajouter l'entrée de planning pour cet employé
      formattedSchedule.push({
        employee_id: emp.id,
        week_start: weekStartStr,
        schedule_data,
      });
    });

    // Construire le résultat final
    return {
      schedule: formattedSchedule,
      stats: {
        total_hours: employeeHours,
        preference_match_rate: metrics.preference_match_rate,
        overworked_employees: metrics.overworked_employees || [],
        average_weekly_hours: metrics.average_weekly_hours || 0,
        uncovered_hours: metrics.uncovered_hours || null,
      },
    };
  }
}

module.exports = AutoScheduleService;
