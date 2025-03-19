/**
 * Utilitaires pour la gestion des arbres de dialogue du chatbot
 */

/**
 * Crée un arbre de dialogue pour la génération de planning
 * @returns {Object} Arbre de dialogue pour la génération de planning
 */
export const createScheduleGenerationTree = () => {
  return {
    // Étape initiale: demander la date de début
    start: {
      message:
        "Je vais vous aider à générer un planning optimisé. Quelle est la date de début de semaine pour ce planning? (format YYYY-MM-DD)",
      nextStep: null,
    },
    // Étape: sélection du département
    department: {
      message: "Pour quel département souhaitez-vous générer le planning?",
      nextStep: null,
    },
    // Étape: choix de la sélection des employés
    employee_selection: {
      message:
        "Souhaitez-vous inclure tous les employés ou sélectionner certains employés spécifiques?",
      options: [
        { label: "Tous les employés", value: "all", next: "min_hours" },
        {
          label: "Sélectionner des employés",
          value: "select",
          next: "select_employees",
        },
      ],
      nextStep: null,
    },
    // Étape: sélection d'employés spécifiques
    select_employees: {
      message:
        "Veuillez entrer les noms ou IDs des employés à inclure, séparés par des virgules.",
      nextStep: "min_hours",
    },
    // Étape: nombre minimum d'heures
    min_hours: {
      message: "Quel est le nombre minimum d'heures par employé?",
      nextStep: "max_hours",
    },
    // Étape: nombre maximum d'heures
    max_hours: {
      message: "Quel est le nombre maximum d'heures par employé?",
      nextStep: "opening_hours",
    },
    // Étape: heures d'ouverture
    opening_hours: {
      message: "Quelles sont les heures d'ouverture? (ex: 09:00-18:00)",
      nextStep: "special_requests",
    },
    // Étape: demandes spéciales
    special_requests: {
      message:
        "Avez-vous des contraintes ou demandes spécifiques pour ce planning?",
      nextStep: "confirmation",
    },
    // Étape: confirmation finale
    confirmation: {
      message: "Dois-je générer le planning avec ces informations?",
      nextStep: null,
    },
  };
};

/**
 * Valide les données d'entrée pour un étape spécifique
 * @param {string} step - Étape actuelle
 * @param {string} input - Entrée utilisateur
 * @param {Object} collectedData - Données déjà collectées
 * @returns {Object} Résultat de la validation (isValid, error, processedValue)
 */
export const validateStepInput = (step, input, collectedData) => {
  switch (step) {
    case "start":
      // Valider le format de date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input)) {
        return {
          isValid: false,
          error:
            "Format de date invalide. Veuillez utiliser le format YYYY-MM-DD, par exemple 2023-06-12.",
          processedValue: null,
        };
      }
      return {
        isValid: true,
        error: null,
        processedValue: input,
        nextStep: "department",
      };

    case "employee_selection":
      if (input === "1" || input.toLowerCase().includes("tous")) {
        return {
          isValid: true,
          error: null,
          processedValue: "all",
          nextStep: "min_hours",
        };
      } else if (
        input === "2" ||
        input.toLowerCase().includes("sélectionner") ||
        input.toLowerCase().includes("specifiques")
      ) {
        return {
          isValid: true,
          error: null,
          processedValue: "select",
          nextStep: "select_employees",
        };
      }
      return {
        isValid: false,
        error:
          "Je n'ai pas compris votre choix. Veuillez répondre '1' pour tous les employés ou '2' pour sélectionner des employés spécifiques.",
        processedValue: null,
      };

    case "select_employees":
      const employees = input.split(",").map((e) => e.trim());
      if (
        employees.length === 0 ||
        (employees.length === 1 && employees[0] === "")
      ) {
        return {
          isValid: false,
          error: "Veuillez entrer au moins un employé.",
          processedValue: null,
        };
      }
      return {
        isValid: true,
        error: null,
        processedValue: employees,
        nextStep: "min_hours",
      };

    case "min_hours":
      const minHours = parseInt(input);
      if (isNaN(minHours) || minHours < 0) {
        return {
          isValid: false,
          error: "Veuillez entrer un nombre valide pour les heures minimum.",
          processedValue: null,
        };
      }
      return {
        isValid: true,
        error: null,
        processedValue: minHours,
        nextStep: "max_hours",
      };

    case "max_hours":
      const maxHours = parseInt(input);
      if (isNaN(maxHours) || maxHours < 0) {
        return {
          isValid: false,
          error: "Veuillez entrer un nombre valide pour les heures maximum.",
          processedValue: null,
        };
      }
      if (collectedData.minHours && maxHours < collectedData.minHours) {
        return {
          isValid: false,
          error:
            "Le nombre maximum d'heures doit être supérieur au nombre minimum. Veuillez réessayer.",
          processedValue: null,
        };
      }
      return {
        isValid: true,
        error: null,
        processedValue: maxHours,
        nextStep: "opening_hours",
      };

    case "opening_hours":
      const hoursRegex = /(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/;
      const match = input.match(hoursRegex);

      if (!match) {
        return {
          isValid: false,
          error:
            "Format d'heures invalide. Veuillez utiliser le format HH:MM-HH:MM, par exemple 09:00-18:00.",
          processedValue: null,
        };
      }
      return {
        isValid: true,
        error: null,
        processedValue: { start: match[1], end: match[2] },
        nextStep: "special_requests",
      };

    case "confirmation":
      if (
        input.toLowerCase().includes("oui") ||
        input.toLowerCase().includes("ok") ||
        input.toLowerCase().includes("générer")
      ) {
        return {
          isValid: true,
          error: null,
          processedValue: true,
          nextStep: "processing",
        };
      } else {
        return {
          isValid: true,
          error: null,
          processedValue: false,
          nextStep: "cancelled",
        };
      }

    // Pour les autres étapes, accepter n'importe quelle entrée
    default:
      return {
        isValid: true,
        error: null,
        processedValue: input,
        nextStep: null,
      };
  }
};

/**
 * Génère un résumé des données collectées pour la confirmation
 * @param {Object} data - Données collectées
 * @returns {string} Résumé formaté
 */
export const generateScheduleSummary = (data) => {
  return `
Voici un résumé des informations pour la génération du planning:
- Semaine du: ${data.weekStart}
- Département: ${data.department}
- Employés: ${
    data.employeeSelection === "all"
      ? "Tous"
      : data.selectedEmployees.join(", ")
  }
- Heures min/max: ${data.minHours}h - ${data.maxHours}h
- Horaires d'ouverture: ${data.openingHours?.start} - ${data.openingHours?.end}
- Demandes spéciales: ${data.specialRequests}

Dois-je générer le planning avec ces informations?
  `;
};

/**
 * Formatte les statistiques de planning
 * @param {Object} stats - Statistiques du planning
 * @returns {string} Message formaté
 */
export const formatScheduleStats = (stats) => {
  return `
Statistiques du planning:
- Nombre d'employés: ${stats.totalEmployees}
- Heures totales: ${stats.totalHours.toFixed(1)}h
- Heures moyennes par employé: ${stats.avgHoursPerEmployee.toFixed(1)}h
- Nombre total de shifts: ${stats.totalShifts}
  `;
};
