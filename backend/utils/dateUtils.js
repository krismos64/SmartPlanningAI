/**
 * Utilitaires pour la gestion des dates côté backend
 */

// Définition des fonctions
/**
 * Formater une date pour MySQL (YYYY-MM-DD)
 * Gère tous les formats de date possibles, y compris les chaînes ISO
 * @param {string|Date} date - Date à formater
 * @returns {string|null} - Date formatée ou null si invalide
 */
const formatDateForMySQL = (date) => {
  if (!date) return null;

  let dateObj;

  try {
    // Si c'est déjà une date
    if (date instanceof Date) {
      dateObj = date;
    }
    // Si c'est une chaîne ISO
    else if (typeof date === "string" && date.includes("T")) {
      // Créer une date en ignorant le fuseau horaire (utiliser la date locale)
      const parts = date.split("T")[0].split("-");
      if (parts.length === 3) {
        // Créer une date avec année, mois (0-indexé), jour
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        dateObj = new Date(date);
      }
    }
    // Autres formats de chaîne
    else {
      dateObj = new Date(date);
    }

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.error("Date invalide:", date);
      return null;
    }

    // Formater la date (YYYY-MM-DD) en utilisant la date locale
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    const formatted = `${year}-${month}-${day}`;
    console.log(`Date formatée pour MySQL: ${date} -> ${formatted}`);

    return formatted;
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error, date);
    return null;
  }
};

/**
 * Formate une date pour l'affichage (DD/MM/YYYY)
 * @param {string|Date} date Date à formater
 * @returns {string} Date formatée
 */
const formatDateForDisplay = (date) => {
  if (!date) return "";

  try {
    // Convertir en objet Date si c'est une chaîne
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.error("Date invalide:", date);
      return "";
    }

    // Formater la date au format DD/MM/YYYY
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "";
  }
};

/**
 * Obtient le lundi de la semaine courante
 * @returns {Date} Date du lundi de la semaine courante
 */
const getCurrentWeekMonday = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster quand aujourd'hui est dimanche

  return new Date(today.setDate(diff));
};

/**
 * Obtient le lundi de la semaine d'une date donnée
 * @param {string|Date} date Date pour laquelle obtenir le lundi de la semaine
 * @returns {Date} Date du lundi de la semaine
 */
const getWeekMonday = (date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // Ajuster quand le jour est dimanche

  return new Date(dateObj.setDate(diff));
};

/**
 * Obtient le dimanche de la semaine d'une date donnée
 * @param {string|Date} date Date pour laquelle obtenir le dimanche de la semaine
 * @returns {Date} Date du dimanche de la semaine
 */
const getWeekSunday = (date) => {
  const monday = getWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return sunday;
};

/**
 * Calcule la différence en heures entre deux heures (format HH:MM)
 * @param {string} startTime Heure de début (HH:MM)
 * @param {string} endTime Heure de fin (HH:MM)
 * @returns {number} Différence en heures
 */
const calculateHoursDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    // Vérifier si les heures sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Heures invalides:", { startTime, endTime });
      return 0;
    }

    // Calculer la différence en heures
    const diff = (end - start) / (1000 * 60 * 60);

    return diff > 0 ? parseFloat(diff.toFixed(2)) : 0;
  } catch (error) {
    console.error("Erreur lors du calcul de la différence d'heures:", error);
    return 0;
  }
};

/**
 * Obtient la date de début de la semaine pour une date donnée
 * @param {string|Date} date - La date de référence
 * @param {number} startDay - Le jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
 * @returns {Date} La date de début de la semaine
 */
const getWeekStart = (date, startDay = 1) => {
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
const getWeekEnd = (date, startDay = 1) => {
  const weekStart = getWeekStart(date, startDay);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return weekEnd;
};

/**
 * Ajoute des jours à une date
 * @param {string|Date} date - La date de départ
 * @param {number} days - Le nombre de jours à ajouter (peut être négatif)
 * @returns {Date} La nouvelle date
 */
const addDays = (date, days) => {
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
const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

/**
 * Vérifie si une date est valide
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} true si la date est valide
 */
const isValidDate = (date) => {
  if (!date) return false;

  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {string|Date} date1 - La première date
 * @param {string|Date} date2 - La deuxième date
 * @returns {number} Le nombre de jours entre les deux dates
 */
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Réinitialiser les heures pour ne compter que les jours
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  // Calculer la différence en millisecondes et convertir en jours
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

module.exports = {
  formatDateForMySQL,
  formatDateForDisplay,
  getCurrentWeekMonday,
  getWeekMonday,
  getWeekSunday,
  calculateHoursDifference,
  getWeekStart,
  getWeekEnd,
  addDays,
  addWeeks,
  isValidDate,
  daysBetween,
};
