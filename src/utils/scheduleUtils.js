/**
 * Utilitaires pour la gestion des plannings
 */

/**
 * Format standard des données de planning
 *
 * Structure:
 * {
 *   employeeId: number,           // ID de l'employé
 *   days: [                       // Tableau de 7 jours (lundi à dimanche)
 *     {
 *       type: string,             // "work" ou "absence"
 *       hours: string,            // Nombre d'heures travaillées (format "0.0")
 *       absence: string,          // Type d'absence (congé, maladie, etc.)
 *       note: string,             // Note ou commentaire
 *       timeSlots: [              // Créneaux horaires
 *         {
 *           start: string,        // Heure de début (format "HH:MM")
 *           end: string,          // Heure de fin (format "HH:MM")
 *           break: string         // Durée de la pause en heures (optionnel)
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

/**
 * Convertit les anciennes données de planning au format standard
 * @param {Object} schedule - Données de planning à convertir
 * @returns {Object} - Données de planning au format standard
 */
export const standardizeScheduleData = (schedule) => {
  if (!schedule) return null;

  // Si le planning est déjà au format standard, le retourner tel quel
  if (
    schedule.days &&
    Array.isArray(schedule.days) &&
    schedule.days.length > 0 &&
    schedule.days[0].type !== undefined
  ) {
    return schedule;
  }

  // Convertir au format standard
  return {
    employeeId: schedule.employeeId || schedule.employee_id,
    days: Array.isArray(schedule.days)
      ? schedule.days.map(convertDayToStandardFormat)
      : Array(7)
          .fill()
          .map(() => createEmptyDay()),
  };
};

/**
 * Convertit un jour de planning au format standard
 * @param {Object} day - Jour de planning à convertir
 * @returns {Object} - Jour de planning au format standard
 */
export const convertDayToStandardFormat = (day) => {
  if (!day) return createEmptyDay();

  // Si le jour est déjà au format standard, le retourner tel quel
  if (day.type) {
    return { ...day };
  }

  // Convertir au format standard
  return {
    type: day.absence ? "absence" : "work",
    hours: day.hours || "0",
    absence: day.absence || "",
    note: day.note || "",
    timeSlots:
      day.timeSlots ||
      (day.hours && parseFloat(day.hours) > 0
        ? [{ start: "09:00", end: "17:00" }]
        : []),
  };
};

/**
 * Crée un jour de planning vide au format standard
 * @returns {Object} - Jour de planning vide
 */
export const createEmptyDay = () => ({
  type: "work",
  hours: "0",
  absence: "",
  note: "",
  timeSlots: [],
});

/**
 * Calcule le total des heures pour un planning
 * @param {Object} schedule - Données de planning
 * @returns {number} - Total des heures
 */
export const calculateTotalHours = (schedule) => {
  if (!schedule || !schedule.days) return 0;

  return schedule.days.reduce((total, day) => {
    return total + (parseFloat(day.hours) || 0);
  }, 0);
};

/**
 * Vérifie si un employé est absent pour un jour donné
 * @param {Object} day - Jour de planning
 * @returns {boolean} - True si l'employé est absent
 */
export const isAbsent = (day) => {
  return (
    day && day.type === "absence" && day.absence && day.absence.trim() !== ""
  );
};

/**
 * Prépare les données de planning pour l'envoi à l'API
 * @param {Object} schedule - Données de planning au format standard
 * @returns {Object} - Données formatées pour l'API
 */
export const prepareScheduleForApi = (schedule) => {
  if (!schedule) return null;

  const standardSchedule = standardizeScheduleData(schedule);

  return {
    employee_id: standardSchedule.employeeId,
    schedule_data: JSON.stringify(standardSchedule.days),
    total_hours: calculateTotalHours(standardSchedule).toFixed(1),
  };
};

/**
 * Analyse les données de planning reçues de l'API
 * @param {Object} apiData - Données reçues de l'API
 * @returns {Object} - Données de planning au format standard
 */
export const parseScheduleFromApi = (apiData) => {
  if (!apiData) return null;

  let days;
  try {
    days =
      typeof apiData.schedule_data === "string"
        ? JSON.parse(apiData.schedule_data)
        : apiData.schedule_data;
  } catch (error) {
    console.error("Erreur lors de l'analyse des données de planning:", error);
    days = Array(7)
      .fill()
      .map(() => createEmptyDay());
  }

  return {
    employeeId: apiData.employee_id,
    days: Array.isArray(days)
      ? days.map(convertDayToStandardFormat)
      : Array(7)
          .fill()
          .map(() => createEmptyDay()),
  };
};

const scheduleUtils = {
  standardizeScheduleData,
  convertDayToStandardFormat,
  createEmptyDay,
  calculateTotalHours,
  isAbsent,
  prepareScheduleForApi,
  parseScheduleFromApi,
};

export default scheduleUtils;
