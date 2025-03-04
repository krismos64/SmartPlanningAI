/**
 * Utilitaires pour la gestion des dates dans l'application
 */

/**
 * Formate une date pour l'affichage
 * @param {string|Date} date - La date à formater
 * @param {string} format - Le format souhaité (par défaut: 'DD/MM/YYYY')
 * @returns {string} La date formatée
 */
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "";

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD MMMM YYYY":
        const monthNames = [
          "janvier",
          "février",
          "mars",
          "avril",
          "mai",
          "juin",
          "juillet",
          "août",
          "septembre",
          "octobre",
          "novembre",
          "décembre",
        ];
        return `${day} ${monthNames[dateObj.getMonth()]} ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "";
  }
};

/**
 * Formate une date pour les champs input de type date
 * @param {string|Date} date - La date à formater
 * @returns {string} La date au format YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return "";

  // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toISOString().split("T")[0];
  } catch (error) {
    console.error("Erreur lors du formatage de la date pour input:", error);
    return "";
  }
};

/**
 * Obtient la date de début de la semaine pour une date donnée
 * @param {string|Date} date - La date de référence
 * @param {number} startDay - Le jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
 * @returns {Date} La date de début de la semaine
 */
export const getWeekStart = (date, startDay = 1) => {
  const dateObj = date ? new Date(date) : new Date();
  const day = dateObj.getDay();
  const diff = (day < startDay ? 7 : 0) + day - startDay;

  dateObj.setDate(dateObj.getDate() - diff);
  dateObj.setHours(0, 0, 0, 0);

  return dateObj;
};

/**
 * Obtient la date de fin de la semaine pour une date donnée
 * @param {string|Date} date - La date de référence
 * @param {number} startDay - Le jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
 * @returns {Date} La date de fin de la semaine
 */
export const getWeekEnd = (date, startDay = 1) => {
  const weekStart = getWeekStart(date, startDay);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return weekEnd;
};

/**
 * Obtient un tableau des jours de la semaine pour une date donnée
 * @param {string|Date} date - La date de référence
 * @param {number} startDay - Le jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
 * @returns {Array<Date>} Un tableau des 7 jours de la semaine
 */
export const getWeekDays = (date, startDay = 1) => {
  const weekStart = getWeekStart(date, startDay);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  return days;
};

/**
 * Obtient le nom du jour de la semaine
 * @param {string|Date} date - La date
 * @param {boolean} short - Indique si le nom doit être court (3 lettres) ou complet
 * @returns {string} Le nom du jour
 */
export const getDayName = (date, short = false) => {
  const dateObj = new Date(date);
  const dayNames = short
    ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    : ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  return dayNames[dateObj.getDay()];
};

/**
 * Obtient le nom du mois
 * @param {string|Date} date - La date
 * @param {boolean} short - Indique si le nom doit être court (3 lettres) ou complet
 * @returns {string} Le nom du mois
 */
export const getMonthName = (date, short = false) => {
  const dateObj = new Date(date);
  const monthNames = short
    ? [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ]
    : [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ];

  return monthNames[dateObj.getMonth()];
};

/**
 * Ajoute des jours à une date
 * @param {string|Date} date - La date de départ
 * @param {number} days - Le nombre de jours à ajouter (peut être négatif)
 * @returns {Date} La nouvelle date
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Ajoute des semaines à une date
 * @param {string|Date} date - La date de départ
 * @param {number} weeks - Le nombre de semaines à ajouter (peut être négatif)
 * @returns {Date} La nouvelle date
 */
export const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

/**
 * Formate une durée en heures et minutes
 * @param {number} hours - Le nombre d'heures (peut inclure des décimales)
 * @returns {string} La durée formatée (ex: "7h30")
 */
export const formatHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return "0h00";
  }

  const totalHours = Math.floor(hours);
  const minutes = Math.round((hours - totalHours) * 60);

  return `${totalHours}h${String(minutes).padStart(2, "0")}`;
};

/**
 * Convertit une durée au format "7h30" en nombre d'heures décimal
 * @param {string} timeString - La durée au format "7h30"
 * @returns {number} Le nombre d'heures décimal (ex: 7.5)
 */
export const parseHours = (timeString) => {
  if (!timeString) return 0;

  const match = timeString.match(/^(\d+)h(\d+)$/);
  if (!match) return 0;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return hours + minutes / 60;
};

/**
 * Formate une date pour MySQL (YYYY-MM-DD)
 * @param {string|Date} date - La date à formater
 * @returns {string} La date au format YYYY-MM-DD
 */
export const formatDateForMySQL = (date) => {
  if (!date) return null;

  // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    return dateObj.toISOString().split("T")[0];
  } catch (error) {
    console.error("Erreur lors du formatage de la date pour MySQL:", error);
    return null;
  }
};
