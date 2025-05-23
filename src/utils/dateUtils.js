/**
 * Utilitaires pour la gestion des dates dans l'application
 */

import {
  addDays,
  addWeeks as addWeeksDate,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { FRENCH_HOLIDAYS_2024 } from "../config/constants";

/**
 * Formate une date selon le format spécifié
 * @param {Date} date - La date à formater
 * @param {string} formatStr - Le format à utiliser (par défaut: 'dd/MM/yyyy')
 * @returns {string} La date formatée
 */
export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "";

  try {
    // S'assurer que date est un objet Date valide
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.error("Date invalide dans formatDate:", date);
      return "";
    }

    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error, date);
    return "";
  }
};

/**
 * Formate une date pour un input HTML (YYYY-MM-DD)
 * @param {Date} date - La date à formater
 * @returns {string} La date au format YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

/**
 * Obtient le premier jour de la semaine pour une date donnée
 * @param {Date} date - La date de référence
 * @returns {Date} Le premier jour de la semaine (lundi)
 */
export const getWeekStart = (date) => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Obtient le dernier jour de la semaine pour une date donnée
 * @param {Date} date - La date de référence
 * @returns {Date} Le dernier jour de la semaine (dimanche)
 */
export const getWeekEnd = (date) => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Ajoute ou soustrait un nombre de semaines à une date
 * @param {Date} date - La date de référence
 * @param {number} amount - Le nombre de semaines à ajouter (négatif pour soustraire)
 * @returns {Date} La nouvelle date
 */
export const addWeeks = (date, amount) => {
  return addWeeksDate(date, amount);
};

/**
 * Obtient un tableau des jours de la semaine pour une date donnée
 * @param {Date} date - La date de référence
 * @returns {Date[]} Un tableau des 7 jours de la semaine
 */
export const getDaysOfWeek = (date) => {
  const weekStart = getWeekStart(date);
  const days = [];

  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }

  return days;
};

/**
 * Vérifie si une date est un weekend (samedi ou dimanche)
 * @param {Date} date - La date à vérifier
 * @returns {boolean} True si c'est un weekend
 */
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
};

/**
 * Calcule le nombre d'heures entre deux dates
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {number} Nombre d'heures
 */
export const calculateHours = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.round(diffHours * 10) / 10; // Arrondi à 1 décimale
};

/**
 * Formate une durée en heures et minutes
 * @param {number} hours - Nombre d'heures (peut inclure des décimales)
 * @returns {string} Durée formatée (ex: "7h30")
 */
export const formatHours = (hours) => {
  if (hours === undefined || hours === null) return "0h";

  const totalHours = parseFloat(hours);
  if (isNaN(totalHours)) return "0h";

  const wholeHours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h${minutes.toString().padStart(2, "0")}`;
  }
};

/**
 * Obtient le nom du jour de la semaine
 * @param {Date} date - La date
 * @param {boolean} short - Si true, retourne le nom court (3 lettres)
 * @returns {string} Le nom du jour
 */
export const getDayName = (date, short = false) => {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const shortDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const dayIndex = new Date(date).getDay();
  return short ? shortDays[dayIndex] : days[dayIndex];
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

/**
 * Formate une date pour l'API (format YYYY-MM-DD)
 * @param {Date} date - La date à formater
 * @returns {string} La date formatée
 */
export const formatDateForAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Vérifie si une date est un jour férié
 * @param {Date} date - La date à vérifier
 * @returns {boolean} - True si la date est un jour férié, false sinon
 */
export const isHoliday = (date) => {
  const dateString = date.toISOString().split("T")[0];
  return FRENCH_HOLIDAYS_2024.some((holiday) => holiday.date === dateString);
};

/**
 * Vérifie si une date est un jour ouvré (lundi au vendredi, hors jours fériés)
 * @param {Date} date - La date à vérifier
 * @returns {boolean} - True si la date est un jour ouvré, false sinon
 */
export const isWorkingDay = (date) => {
  const day = date.getDay();
  // 0 = dimanche, 6 = samedi
  return day !== 0 && day !== 6 && !isHoliday(date);
};

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {number} - Nombre de jours ouvrés
 */
export const getWorkingDaysCount = (startDate, endDate) => {
  // Cloner les dates pour ne pas modifier les originales
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Réinitialiser les heures pour éviter les problèmes de comparaison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Si la date de fin est avant la date de début, retourner 0
  if (end < start) {
    return 0;
  }

  // Compter les jours ouvrés
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (isWorkingDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Ajoute un nombre de jours ouvrés à une date
 * @param {Date} date - Date de départ
 * @param {number} days - Nombre de jours ouvrés à ajouter
 * @returns {Date} - Nouvelle date
 */
export const addWorkingDays = (date, days) => {
  const result = new Date(date);
  let daysAdded = 0;

  while (daysAdded < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) {
      daysAdded++;
    }
  }

  return result;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} True si c'est aujourd'hui, false sinon
 */
export const isToday = (date) => {
  if (!date) return false;
  return isSameDay(new Date(date), new Date());
};

/**
 * Vérifie si une date est entre deux autres dates (inclusivement)
 * @param {string|Date} date - La date à vérifier
 * @param {string|Date} start - Date de début
 * @param {string|Date} end - Date de fin
 * @returns {boolean} True si la date est entre start et end, false sinon
 */
export const isDateBetween = (date, start, end) => {
  if (!date || !start || !end) return false;

  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);

  // Réinitialiser les heures pour comparer uniquement les dates
  d.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  return d >= s && d <= e;
};

/**
 * Formate une date pour l'affichage en format français
 * @param {string|Date} date - La date à formater
 * @param {string} formatStr - Le format à utiliser (par défaut: 'dd/MM/yyyy')
 * @returns {string} La date formatée
 */
export const formatDateForDisplay = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "";

  try {
    // Si la date est déjà au format YYYY-MM-DD, la convertir en objet Date
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Formater la date selon le format spécifié
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
 * Vérifie si une date est dans le passé
 * @param {Date} date - La date à vérifier
 * @returns {boolean} Vrai si la date est dans le passé
 */
export const isPast = (date) => {
  return isBefore(date, new Date()) && !isToday(date);
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date} date - La date à vérifier
 * @returns {boolean} Vrai si la date est dans le futur
 */
export const isFuture = (date) => {
  return isAfter(date, new Date());
};

/**
 * Génère un tableau des jours de la semaine à partir d'une date de début
 * @param {Date} startDate - La date de début de la semaine
 * @returns {Array} Un tableau des jours de la semaine
 */
export const getWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

/**
 * Formate une date pour l'affichage dans un format court
 * @param {Date} date - La date à formater
 * @returns {string} La date formatée
 */
export const formatShortDate = (date) => {
  return format(date, "EEE dd/MM", { locale: fr });
};

/**
 * Formate une date pour l'affichage dans un format long
 * @param {Date} date - La date à formater
 * @returns {string} La date formatée
 */
export const formatLongDate = (date) => {
  return format(date, "EEEE dd MMMM yyyy", { locale: fr });
};

/**
 * Obtient le jour de la semaine (0-6, où 0 est dimanche)
 * @param {Date} date - La date
 * @returns {number} Le jour de la semaine
 */
export const getDayOfWeek = (date) => {
  return getDay(date);
};

/**
 * Formate une heure pour l'affichage
 * @param {number} hours - Les heures
 * @param {number} minutes - Les minutes
 * @returns {string} L'heure formatée
 */
export const formatTime = (hours, minutes = 0) => {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Convertit une chaîne de caractères au format "HH:MM" en minutes
 * @param {string} timeString - La chaîne de caractères au format "HH:MM"
 * @returns {number} Le nombre de minutes
 */
export const timeStringToMinutes = (timeString) => {
  if (!timeString) return 0;

  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convertit des minutes en chaîne de caractères au format "HH:MM"
 * @param {number} minutes - Le nombre de minutes
 * @returns {string} La chaîne de caractères au format "HH:MM"
 */
export const minutesToTimeString = (minutes) => {
  if (!minutes && minutes !== 0) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Vérifie si une date est dans une plage de dates
 * @param {Date} date - La date à vérifier
 * @param {Date} start - La date de début de la plage
 * @param {Date} end - La date de fin de la plage
 * @returns {boolean} Vrai si la date est dans la plage
 */
export const isDateInRange = (date, start, end) => {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
};

/**
 * Formate une date et une heure au format français
 * @param {string|Date} date - La date à formater
 * @returns {Object} - Un objet contenant la date et l'heure formatées
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return { date: "", time: "" };

  try {
    const date = new Date(timestamp);

    return {
      date: format(date, "dd MMMM yyyy", { locale: fr }),
      time: format(date, "HH:mm:ss", { locale: fr }),
    };
  } catch (error) {
    console.error("Erreur lors du formatage de la date et de l'heure:", error);
    return { date: "", time: "" };
  }
};

/**
 * Formate une date relative (il y a X minutes, etc.)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date relative formatée
 */
export const formatRelativeDate = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // Formater la date en fonction de son ancienneté
    if (diffSec < 60) {
      return "à l'instant";
    } else if (diffMin < 60) {
      return `il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
    } else if (diffHour < 24) {
      return `il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
    } else if (diffDay < 7) {
      return `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
    } else {
      return format(date, "dd/MM/yyyy", { locale: fr });
    }
  } catch (error) {
    console.error("Erreur lors du formatage de la date relative:", error);
    return "";
  }
};

/**
 * Obtient le nom du jour de la semaine à partir d'un indice
 * @param {number} index - Indice du jour (0 = dimanche, 1 = lundi, etc.)
 * @param {string} locale - Locale à utiliser (fr-FR par défaut)
 * @returns {string} Nom du jour
 */
export const getWeekDayName = (index, locale = "fr-FR") => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + index);
  return date.toLocaleDateString(locale, { weekday: "long" });
};

/**
 * Formate une date en utilisant les options de la locale
 * @param {Date|string} date - Date à formater
 * @param {string} locale - Locale à utiliser (fr-FR par défaut)
 * @param {Object} options - Options de formatage
 * @returns {string} Date formatée selon la locale
 */
export const formatDateToLocale = (
  date,
  locale = "fr-FR",
  options = { dateStyle: "full" }
) => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, options);
};

// Créer une variable nommée pour l'export
const dateUtils = {
  addWeeks,
  getWeekStart,
  isToday,
  isPast,
  isFuture,
  getWeekDays,
  formatShortDate,
  formatLongDate,
  getDayOfWeek,
  formatTime,
  timeStringToMinutes,
  minutesToTimeString,
  formatDateForDisplay,
  isDateInRange,
  formatDateTime,
  formatRelativeDate,
  getWeekDayName,
  formatDateToLocale,
};

export default dateUtils;
