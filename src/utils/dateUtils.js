/**
 * Utilitaires pour la gestion des dates dans l'application
 */

import {
  addDays,
  addWeeks as addWeeksDate,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date selon le format spécifié
 * @param {Date} date - La date à formater
 * @param {string} formatStr - Le format à utiliser (par défaut: 'dd/MM/yyyy')
 * @returns {string} La date formatée
 */
export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "";
  return format(date, formatStr, { locale: fr });
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
 * Vérifie si une date est un jour de weekend (samedi ou dimanche)
 * @param {Date} date - La date à vérifier
 * @returns {boolean} Vrai si c'est un weekend, faux sinon
 */
export const isWeekend = (date) => {
  const day = date.getDay();
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
