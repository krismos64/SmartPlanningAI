/**
 * Utilitaires de traitement du langage naturel (NLP) pour le chatbot
 * Ces fonctions aident à comprendre les intentions de l'utilisateur et à extraire des informations
 * des messages pour permettre au chatbot d'agir en conséquence.
 */

/**
 * Déterminer l'intention de l'utilisateur à partir de son message
 * @param {string} message - Message de l'utilisateur
 * @returns {Object} - Intention identifiée et paramètres extraits
 */
export const detectIntent = (message) => {
  // Normaliser le message (minuscules, sans accents)
  const normalizedMessage = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Intentions pour l'aide et l'accueil
  if (
    containsAny(normalizedMessage, [
      "aide",
      "help",
      "assistance",
      "guidez-moi",
      "guide moi",
      "besoin d'aide",
      "que peux-tu faire",
      "que sais-tu faire",
      "fonctionnalites",
      "commandes",
      "comment ca marche",
      "comment fonctionne",
    ])
  ) {
    return { intent: "HELP", params: {} };
  }

  // Intentions liées aux plannings
  if (
    containsAny(normalizedMessage, [
      "generer planning",
      "generer un planning",
      "creer planning",
      "creer un planning",
      "faire planning",
      "faire un planning",
      "planning semaine",
      "planning pour la semaine",
      "nouveau planning",
      "etablir planning",
      "planifier",
      "organiser planning",
      "preparer planning",
    ])
  ) {
    const params = {
      weekStart: extractDate(message) || getCurrentMonday(),
    };
    return { intent: "GENERATE_SCHEDULE", params };
  }

  if (
    containsAny(normalizedMessage, [
      "voir planning",
      "consulter planning",
      "afficher planning",
      "mon planning",
      "planning de",
      "planification",
      "emploi du temps",
      "horaires de travail",
      "edt",
      "montre planning",
      "affiche les horaires",
      "quels sont mes horaires",
      "planning hebdomadaire",
    ])
  ) {
    const params = {
      weekStart: extractDate(message) || getCurrentMonday(),
      employeeId: extractEmployeeInfo(message),
    };
    return { intent: "VIEW_SCHEDULE", params };
  }

  // Intentions liées aux congés
  if (
    containsAny(normalizedMessage, [
      "puis-je poser",
      "puis je poser",
      "disponibilite conge",
      "disponibilite pour conge",
      "verifier conge",
      "verifier disponibilite",
      "peut-on poser",
      "peut on poser",
      "est-ce que je peux prendre",
      "est-ce possible de poser",
      "suis-je disponible",
      "peut-on m'accorder",
      "ai-je droit a des conges",
      "combien de jours de conges",
      "conges disponibles",
      "vacances disponibles",
    ])
  ) {
    const dateRange = extractDateRange(message);
    return {
      intent: "CHECK_VACATION_AVAILABILITY",
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        employeeId: extractEmployeeInfo(message),
      },
    };
  }

  if (
    containsAny(normalizedMessage, [
      "demande conge",
      "demander conge",
      "poser conge",
      "poser des conges",
      "creer conge",
      "nouvelle demande",
      "demande de vacances",
      "prendre des vacances",
      "poser des jours",
      "poser jour",
      "prendre conge",
      "partir en vacances",
      "s'absenter",
      "rtt",
      "jour off",
      "jour de repos",
      "prendre ma journee",
    ])
  ) {
    const dateRange = extractDateRange(message);
    return {
      intent: "CREATE_VACATION_REQUEST",
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        employeeId: extractEmployeeInfo(message),
        type: extractVacationType(message),
      },
    };
  }

  // Intentions liées aux statistiques
  if (
    containsAny(normalizedMessage, [
      "statistique",
      "stats",
      "resume",
      "bilan",
      "heures travaillees",
      "combien d'heures",
      "rapport",
      "synthese",
      "analyse",
      "tendance",
      "resultats",
      "performance",
      "indicateurs",
      "kpi",
      "dashboard",
      "tableau de bord",
      "visualiser donnees",
      "chiffres",
    ])
  ) {
    const period = extractPeriod(message) || "month";
    return {
      intent: "GET_STATS",
      params: {
        period,
        employeeId: extractEmployeeInfo(message),
      },
    };
  }

  // Intentions liées aux optimisations
  if (
    containsAny(normalizedMessage, [
      "optimiser",
      "optimiser planning",
      "suggestion",
      "suggestion horaire",
      "horaire optimal",
      "meilleur creneau",
      "creneaux optimaux",
      "ameliorer planning",
      "recommandation",
      "conseiller",
      "conseille-moi",
      "planification intelligente",
      "planning efficace",
      "temps optimaux",
      "meilleures heures",
      "proposition",
    ])
  ) {
    const params = {
      weekStart: extractDate(message) || getCurrentMonday(),
      employeeId: extractEmployeeInfo(message),
    };
    return { intent: "GET_OPTIMAL_SCHEDULE", params };
  }

  // Intention liée à la liste des employés
  if (
    containsAny(normalizedMessage, [
      "liste employe",
      "liste des employes",
      "employes disponibles",
      "tous les employes",
      "personnel",
      "equipe",
      "membres equipe",
      "qui travaille",
      "collaborateurs",
      "trombinoscope",
      "organigramme",
    ])
  ) {
    return { intent: "LIST_EMPLOYEES", params: {} };
  }

  // Intention liée à la notification et rappels
  if (
    containsAny(normalizedMessage, [
      "rappel",
      "notification",
      "alerte",
      "prevenir",
      "me rappeler",
      "rappelle-moi",
      "n'oublie pas",
      "programmer rappel",
      "recevoir alerte",
    ])
  ) {
    const date = extractDate(message) || formatDateYYYYMMDD(new Date());
    return {
      intent: "SET_REMINDER",
      params: {
        date,
        message: message,
      },
    };
  }

  // Intention pour les préférences utilisateur
  if (
    containsAny(normalizedMessage, [
      "preference",
      "parametre",
      "reglage",
      "configuration",
      "personnaliser",
      "customiser",
      "adapter",
      "modifier profil",
      "changer preferences",
      "mon profil",
      "mes infos",
    ])
  ) {
    return { intent: "USER_PREFERENCES", params: {} };
  }

  // Intention pour chercher de l'information
  if (
    containsAny(normalizedMessage, [
      "comment",
      "explique",
      "montre",
      "recherche",
      "trouve",
      "cherche",
      "informations sur",
      "info sur",
      "a propos de",
      "qu'est-ce que",
      "que signifie",
      "c'est quoi",
    ])
  ) {
    return {
      intent: "SEARCH_INFO",
      params: {
        query: message,
      },
    };
  }

  // Intention pour le feedback
  if (
    containsAny(normalizedMessage, [
      "feedback",
      "avis",
      "commentaire",
      "suggestion",
      "amelioration",
      "bug",
      "probleme",
      "erreur",
      "ca ne marche pas",
      "ameliorer",
      "rapport de bug",
    ])
  ) {
    return {
      intent: "FEEDBACK",
      params: {
        message: message,
      },
    };
  }

  // Intention par défaut
  return { intent: "UNKNOWN", params: {} };
};

/**
 * Extraire une date d'un message
 * @param {string} message - Message contenant potentiellement une date
 * @returns {string|null} - Date au format YYYY-MM-DD ou null si non trouvée
 */
export const extractDate = (message) => {
  // Recherche de dates explicites (ex: "01/01/2023", "2023-01-01")
  const explicitDateRegex = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/g;
  const match = explicitDateRegex.exec(message);

  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${year}-${month}-${day}`;
  }

  // Recherche de dates relatives
  const normalizedMessage = message.toLowerCase();

  if (
    containsAny(normalizedMessage, ["aujourd'hui", "aujourd hui", "ce jour"])
  ) {
    const today = new Date();
    return formatDateYYYYMMDD(today);
  }

  if (containsAny(normalizedMessage, ["demain"])) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateYYYYMMDD(tomorrow);
  }

  if (containsAny(normalizedMessage, ["apres-demain", "apres demain"])) {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return formatDateYYYYMMDD(dayAfterTomorrow);
  }

  if (
    containsAny(normalizedMessage, [
      "semaine prochaine",
      "la semaine prochaine",
    ])
  ) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDateYYYYMMDD(nextWeek);
  }

  // Recherche de jours de la semaine
  const dayMapping = {
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
    dimanche: 0,
  };

  for (const [day, dayNumber] of Object.entries(dayMapping)) {
    if (normalizedMessage.includes(day)) {
      const today = new Date();
      const todayNumber = today.getDay();
      let daysToAdd = dayNumber - todayNumber;

      // Si le jour mentionné est déjà passé cette semaine, prendre celui de la semaine prochaine
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }

      const targetDate = new Date();
      targetDate.setDate(today.getDate() + daysToAdd);
      return formatDateYYYYMMDD(targetDate);
    }
  }

  // Si aucune date trouvée
  return null;
};

/**
 * Extraire une plage de dates d'un message
 * @param {string} message - Message contenant potentiellement une plage de dates
 * @returns {Object} - Dates de début et de fin
 */
export const extractDateRange = (message) => {
  // Recherche de plages explicites (ex: "du 01/01/2023 au 15/01/2023")
  const rangeRegex =
    /du (\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4}) au (\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/i;
  const match = rangeRegex.exec(message);

  if (match) {
    const startDay = match[1].padStart(2, "0");
    const startMonth = match[2].padStart(2, "0");
    const startYear = match[3].length === 2 ? `20${match[3]}` : match[3];

    const endDay = match[4].padStart(2, "0");
    const endMonth = match[5].padStart(2, "0");
    const endYear = match[6].length === 2 ? `20${match[6]}` : match[6];

    return {
      start: `${startYear}-${startMonth}-${startDay}`,
      end: `${endYear}-${endMonth}-${endDay}`,
    };
  }

  // Recherche de plages relatives ("pendant une semaine", "pour 3 jours", etc.)
  const normalizedMessage = message.toLowerCase();

  // Expressions pour durées relatives
  const durationPatterns = [
    { regex: /pendant (\d+) jour(s)?/i, unit: "days" },
    { regex: /pour (\d+) jour(s)?/i, unit: "days" },
    { regex: /(\d+) jour(s)?/i, unit: "days" },
    { regex: /pendant (\d+) semaine(s)?/i, unit: "weeks" },
    { regex: /pour (\d+) semaine(s)?/i, unit: "weeks" },
    { regex: /(\d+) semaine(s)?/i, unit: "weeks" },
  ];

  for (const pattern of durationPatterns) {
    const durationMatch = normalizedMessage.match(pattern.regex);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1], 10);
      const startDate = extractDate(message) || formatDateYYYYMMDD(new Date());
      const start = new Date(startDate);
      const end = new Date(startDate);

      if (pattern.unit === "days") {
        end.setDate(end.getDate() + amount);
      } else if (pattern.unit === "weeks") {
        end.setDate(end.getDate() + amount * 7);
      }

      return {
        start: startDate,
        end: formatDateYYYYMMDD(end),
      };
    }
  }

  // Si pas de plage explicite, chercher une date simple
  const singleDate = extractDate(message);
  if (singleDate) {
    // Par défaut, la plage est de 1 jour
    const startDate = new Date(singleDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return {
      start: singleDate,
      end: formatDateYYYYMMDD(endDate),
    };
  }

  // Si aucune date trouvée, utiliser la semaine en cours
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return {
    start: formatDateYYYYMMDD(today),
    end: formatDateYYYYMMDD(nextWeek),
  };
};

/**
 * Extraire des informations sur un employé à partir d'un message
 * @param {string} message - Message contenant potentiellement des informations sur un employé
 * @returns {string|null} - ID de l'employé ou null pour l'utilisateur courant
 */
export const extractEmployeeInfo = (message) => {
  // À implémenter selon les besoins spécifiques de l'application
  // Exemple simple de détection de noms d'employés
  const normalizedMessage = message.toLowerCase();

  if (
    containsAny(normalizedMessage, [
      "mon",
      "mes",
      "je",
      "moi",
      "ma",
      "pour moi",
      "me concerne",
      "me concernant",
      "à mon nom",
      "mon compte",
    ])
  ) {
    // Utiliser l'utilisateur courant
    return null;
  }

  // Détection d'employés par leur prénom/nom
  // Cette partie pourrait être améliorée en récupérant dynamiquement
  // la liste des employés depuis l'API et en cherchant des correspondances

  return null;
};

/**
 * Extraire le type de congé à partir d'un message
 * @param {string} message - Message contenant potentiellement un type de congé
 * @returns {string} - Type de congé
 */
export const extractVacationType = (message) => {
  const normalizedMessage = message.toLowerCase();

  if (
    containsAny(normalizedMessage, [
      "maladie",
      "arret",
      "arrêt",
      "malade",
      "médical",
      "medical",
      "sante",
      "santé",
    ])
  ) {
    return "sick_leave";
  }

  if (
    containsAny(normalizedMessage, [
      "formation",
      "training",
      "stage",
      "cours",
      "apprendre",
      "formation professionnelle",
      "certifier",
      "certification",
    ])
  ) {
    return "training";
  }

  if (
    containsAny(normalizedMessage, [
      "familial",
      "famille",
      "enfant",
      "parent",
      "naissance",
      "maternité",
      "paternité",
      "enfants",
    ])
  ) {
    return "family";
  }

  if (
    containsAny(normalizedMessage, [
      "sans solde",
      "non payé",
      "non paye",
      "non rémunéré",
      "non remunere",
    ])
  ) {
    return "unpaid";
  }

  if (
    containsAny(normalizedMessage, [
      "télétravail",
      "teletravail",
      "à distance",
      "a distance",
      "remote",
      "chez moi",
      "à domicile",
      "a domicile",
    ])
  ) {
    return "remote_work";
  }

  // Par défaut, congés payés
  return "vacation";
};

/**
 * Extraire la période à partir d'un message
 * @param {string} message - Message contenant potentiellement une période
 * @returns {string} - Période (week, month, year)
 */
export const extractPeriod = (message) => {
  const normalizedMessage = message.toLowerCase();

  if (
    containsAny(normalizedMessage, [
      "semaine",
      "hebdomadaire",
      "cette semaine",
      "7 jours",
      "sept jours",
      "semaine en cours",
      "semaine passée",
      "semaine dernière",
    ])
  ) {
    return "week";
  }

  if (
    containsAny(normalizedMessage, [
      "annee",
      "annuel",
      "année",
      "sur l'annee",
      "sur l'année",
      "12 mois",
      "douze mois",
      "an",
      "annuellement",
      "sur un an",
    ])
  ) {
    return "year";
  }

  if (
    containsAny(normalizedMessage, [
      "trimestre",
      "trimestriel",
      "3 mois",
      "trois mois",
      "quart d'année",
      "trimestre en cours",
    ])
  ) {
    return "quarter";
  }

  // Par défaut, mois
  return "month";
};

/**
 * Extraire des mots-clés d'un message
 * @param {string} message - Message à analyser
 * @returns {string[]} - Mots-clés extraits
 */
export const extractKeywords = (message) => {
  const normalizedMessage = message.toLowerCase();
  const words = normalizedMessage.split(/\s+/);

  // Liste de mots vides (stopwords) français à ignorer
  const stopwords = [
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "du",
    "de",
    "ce",
    "cette",
    "ces",
    "mon",
    "ma",
    "mes",
    "ton",
    "ta",
    "tes",
    "son",
    "sa",
    "ses",
    "notre",
    "nos",
    "votre",
    "vos",
    "leur",
    "leurs",
    "et",
    "ou",
    "mais",
    "donc",
    "car",
    "ni",
    "que",
    "qui",
    "quoi",
    "comment",
    "pourquoi",
    "a",
    "à",
    "en",
    "dans",
    "sur",
    "sous",
    "avec",
    "sans",
    "pour",
    "par",
    "je",
    "tu",
    "il",
    "elle",
    "nous",
    "vous",
    "ils",
    "elles",
    "suis",
    "es",
    "est",
    "sommes",
    "êtes",
    "sont",
    "ai",
    "as",
    "a",
    "avons",
    "avez",
    "ont",
    "au",
    "aux",
    "y",
    "cela",
    "ça",
    "c'est",
    "est-ce",
    "as-tu",
    "ai-je",
    "n'est",
  ];

  // Filtrer les mots vides et les mots courts
  return words.filter(
    (word) =>
      word.length > 2 && !stopwords.includes(word) && !/^\d+$/.test(word)
  );
};

/**
 * Détecter le sentiment d'un message (très basique)
 * @param {string} message - Message à analyser
 * @returns {string} - Sentiment ('positive', 'negative', 'neutral')
 */
export const detectSentiment = (message) => {
  const normalizedMessage = message.toLowerCase();

  const positiveWords = [
    "bien",
    "super",
    "génial",
    "excellent",
    "parfait",
    "bravo",
    "merci",
    "content",
    "heureux",
    "satisfait",
    "aime",
    "top",
    "formidable",
    "extraordinaire",
    "facile",
    "agréable",
    "plaît",
    "plaisir",
    "efficace",
    "réussi",
    "réussir",
  ];

  const negativeWords = [
    "mauvais",
    "problème",
    "erreur",
    "bug",
    "difficile",
    "compliqué",
    "impossible",
    "pas",
    "non",
    "jamais",
    "déçu",
    "déception",
    "nul",
    "horrible",
    "terrible",
    "déteste",
    "hais",
    "inutile",
    "frustrant",
    "colère",
    "fâché",
    "échoué",
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  // Calculer les scores
  positiveWords.forEach((word) => {
    if (normalizedMessage.includes(word)) positiveScore++;
  });

  negativeWords.forEach((word) => {
    if (normalizedMessage.includes(word)) negativeScore++;
  });

  // Déterminer le sentiment
  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
};

/**
 * Formater une date au format YYYY-MM-DD
 * @param {Date} date - Date à formater
 * @returns {string} - Date formatée
 */
export const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Obtenir le lundi de la semaine en cours
 * @returns {string} - Date du lundi au format YYYY-MM-DD
 */
export const getCurrentMonday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster lorsque c'est dimanche
  const monday = new Date(today.setDate(diff));
  return formatDateYYYYMMDD(monday);
};

/**
 * Vérifie si une chaîne contient au moins un élément d'un tableau
 * @param {string} str - La chaîne à vérifier
 * @param {string[]} items - Les éléments à rechercher
 * @returns {boolean} - True si au moins un élément est trouvé
 */
const containsAny = (str, items) => {
  if (!str) return false;
  return items.some((item) => str.includes(item));
};

// Création d'une variable pour l'objet avant l'export
const nlpUtils = {
  detectIntent,
  extractDate,
  extractDateRange,
  extractEmployeeInfo,
  extractVacationType,
  extractPeriod,
  formatDateYYYYMMDD,
  getCurrentMonday,
  containsAny,
  extractKeywords,
  detectSentiment,
};

export default nlpUtils;
