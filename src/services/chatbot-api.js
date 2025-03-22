import { API_ENDPOINTS, apiRequest } from "../config/api";
import { formatDateForAPI } from "../utils/dateUtils";
import { EmployeeService, VacationService, WeeklyScheduleService } from "./api";

/**
 * Service pour les actions du chatbot intelligent
 * Fournit des méthodes permettant au chatbot d'interagir avec l'API
 */
export const ChatbotService = {
  /**
   * Vérifie la disponibilité pour poser des congés
   * @param {string} employeeId - ID de l'employé
   * @param {Date|string} startDate - Date de début des congés
   * @param {Date|string} endDate - Date de fin des congés
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  checkVacationAvailability: async (employeeId, startDate, endDate) => {
    try {
      // Si aucun employé n'est spécifié, utiliser l'utilisateur courant
      if (!employeeId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Employé non spécifié et utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        employeeId = user.id;
      }

      // Formater les dates
      const formattedStartDate =
        startDate instanceof Date ? formatDateForAPI(startDate) : startDate;

      const formattedEndDate =
        endDate instanceof Date ? formatDateForAPI(endDate) : endDate;

      // Appel à l'API pour vérifier la disponibilité
      const response = await apiRequest(
        `${API_ENDPOINTS.VACATIONS.BASE}/check-availability`,
        "POST",
        {
          employee_id: employeeId,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        }
      );

      if (response.error) {
        return {
          success: false,
          message:
            response.error || "Erreur lors de la vérification de disponibilité",
        };
      }

      return {
        success: true,
        available: response.available,
        conflicts: response.conflicts || [],
        message: response.message || "Vérification de disponibilité effectuée",
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la vérification de disponibilité",
      };
    }
  },

  /**
   * Créer une demande de congés
   * @param {Object} vacationData - Données de la demande de congés
   * @returns {Promise<Object>} - Résultat de la création
   */
  createVacationRequest: async (vacationData) => {
    try {
      // Si aucun employé n'est spécifié, utiliser l'utilisateur courant
      if (!vacationData.employee_id) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Employé non spécifié et utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        vacationData.employee_id = user.id;
      }

      // Créer la demande de congés
      const result = await VacationService.create(vacationData);
      return result;
    } catch (error) {
      console.error("Erreur lors de la création de congés:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la création de la demande de congés",
      };
    }
  },

  /**
   * Générer automatiquement un planning pour une semaine donnée
   * @param {string} weekStart - Date de début de la semaine (YYYY-MM-DD)
   * @param {Object} options - Options de génération du planning
   * @returns {Promise<Object>} - Résultat de la génération
   */
  generateSchedule: async (weekStart, options = {}) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/generate`,
        "POST",
        {
          week_start: weekStart,
          ...options,
        }
      );

      if (response.error) {
        return {
          success: false,
          message: response.error || "Erreur lors de la génération du planning",
        };
      }

      return {
        success: true,
        schedule: response.schedule,
        message: "Planning généré avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la génération du planning",
      };
    }
  },

  /**
   * Obtenir un résumé des disponibilités des employés pour une période donnée
   * @param {Date|string} startDate - Date de début
   * @param {Date|string} endDate - Date de fin
   * @returns {Promise<Object>} - Résultat de la recherche
   */
  getEmployeeAvailabilitySummary: async (startDate, endDate) => {
    try {
      // Formater les dates
      const formattedStartDate =
        startDate instanceof Date ? formatDateForAPI(startDate) : startDate;

      const formattedEndDate =
        endDate instanceof Date ? formatDateForAPI(endDate) : endDate;

      const response = await apiRequest(
        `${API_ENDPOINTS.EMPLOYEES.BASE}/availability`,
        "POST",
        {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        }
      );

      if (response.error) {
        return {
          success: false,
          message:
            response.error ||
            "Erreur lors de la récupération des disponibilités",
        };
      }

      return {
        success: true,
        availabilities: response.availabilities || [],
        message: "Disponibilités récupérées avec succès",
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des disponibilités:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des disponibilités",
      };
    }
  },

  /**
   * Obtenir des suggestions de créneau optimal pour un employé
   * @param {string} employeeId - ID de l'employé
   * @param {string} weekStart - Date de début de la semaine (YYYY-MM-DD)
   * @returns {Promise<Object>} - Résultat de la suggestion
   */
  getOptimalScheduleSuggestion: async (employeeId, weekStart) => {
    try {
      // Si aucun employé n'est spécifié, utiliser l'utilisateur courant
      if (!employeeId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Employé non spécifié et utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        employeeId = user.id;
      }

      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/suggest-optimal`,
        "POST",
        {
          employee_id: employeeId,
          week_start: weekStart,
        }
      );

      if (response.error) {
        return {
          success: false,
          message:
            response.error ||
            "Erreur lors de la recherche de créneaux optimaux",
        };
      }

      return {
        success: true,
        suggestions: response.suggestions || [],
        message: "Suggestions de créneaux récupérées avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la recherche de créneaux optimaux:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la recherche de créneaux optimaux",
      };
    }
  },

  /**
   * Obtenir un résumé des statistiques pour un employé
   * @param {string} employeeId - ID de l'employé (optionnel, utilise l'utilisateur courant si non spécifié)
   * @param {string} period - Période (week, month, year)
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getEmployeeStats: async (employeeId, period = "month") => {
    try {
      // Si aucun employé n'est spécifié, utiliser l'utilisateur courant
      if (!employeeId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Employé non spécifié et utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        employeeId = user.id;
      }

      const response = await apiRequest(
        `${API_ENDPOINTS.EMPLOYEES.BY_ID(employeeId)}/stats`,
        "GET",
        { period }
      );

      if (response.error) {
        return {
          success: false,
          message:
            response.error || "Erreur lors de la récupération des statistiques",
        };
      }

      return {
        success: true,
        stats: response || {},
        message: "Statistiques récupérées avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des statistiques",
      };
    }
  },

  /**
   * Obtenir la liste des employés
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getEmployeesList: async () => {
    try {
      const result = await EmployeeService.getAll();

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        employees: result.employees,
        message: "Liste des employés récupérée avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des employés",
      };
    }
  },

  /**
   * Définir un rappel pour l'utilisateur
   * @param {string} date - Date du rappel (YYYY-MM-DD)
   * @param {string} message - Message du rappel
   * @param {string} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<Object>} - Résultat de la création
   */
  setReminder: async (date, message, userId = null) => {
    try {
      // Si aucun utilisateur n'est spécifié, utiliser l'utilisateur courant
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        userId = user.id;
      }

      // Stocker le rappel dans le localStorage pour l'instant (solution temporaire)
      // Dans une implémentation réelle, on enverrait à l'API
      const remindersStr = localStorage.getItem("chatbot_reminders") || "{}";
      const reminders = JSON.parse(remindersStr);

      if (!reminders[userId]) {
        reminders[userId] = [];
      }

      const reminder = {
        id: Date.now().toString(),
        date,
        message,
        createdAt: new Date().toISOString(),
        isDone: false,
      };

      reminders[userId].push(reminder);
      localStorage.setItem("chatbot_reminders", JSON.stringify(reminders));

      return {
        success: true,
        reminder,
        message: "Rappel créé avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la création du rappel:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la création du rappel",
      };
    }
  },

  /**
   * Récupérer les rappels de l'utilisateur
   * @param {string} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getReminders: async (userId = null) => {
    try {
      // Si aucun utilisateur n'est spécifié, utiliser l'utilisateur courant
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        userId = user.id;
      }

      // Récupérer les rappels du localStorage
      const remindersStr = localStorage.getItem("chatbot_reminders") || "{}";
      const reminders = JSON.parse(remindersStr);

      return {
        success: true,
        reminders: reminders[userId] || [],
        message: "Rappels récupérés avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des rappels:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des rappels",
      };
    }
  },

  /**
   * Enregistrer un feedback utilisateur
   * @param {string} message - Message de feedback
   * @param {string} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<Object>} - Résultat de l'enregistrement
   */
  saveFeedback: async (message, userId = null) => {
    try {
      // Si aucun utilisateur n'est spécifié, utiliser l'utilisateur courant
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        userId = user.id;
      }

      // Stocker le feedback dans le localStorage (solution temporaire)
      const feedbacksStr = localStorage.getItem("chatbot_feedback") || "[]";
      const feedbacks = JSON.parse(feedbacksStr);

      const feedback = {
        id: Date.now().toString(),
        userId,
        message,
        createdAt: new Date().toISOString(),
      };

      feedbacks.push(feedback);
      localStorage.setItem("chatbot_feedback", JSON.stringify(feedbacks));

      return {
        success: true,
        feedback,
        message: "Feedback enregistré avec succès. Merci pour votre retour!",
      };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du feedback:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de l'enregistrement du feedback",
      };
    }
  },

  /**
   * Mettre à jour les préférences utilisateur pour le chatbot
   * @param {Object} preferences - Préférences à mettre à jour
   * @param {string} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateUserPreferences: async (preferences, userId = null) => {
    try {
      // Si aucun utilisateur n'est spécifié, utiliser l'utilisateur courant
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        userId = user.id;
      }

      // Récupérer les préférences actuelles
      const prefsStr = localStorage.getItem("chatbot_preferences") || "{}";
      const prefs = JSON.parse(prefsStr);

      // Mettre à jour les préférences
      if (!prefs[userId]) {
        prefs[userId] = {};
      }

      const updatedPrefs = {
        ...prefs[userId],
        ...preferences,
        updatedAt: new Date().toISOString(),
      };

      prefs[userId] = updatedPrefs;
      localStorage.setItem("chatbot_preferences", JSON.stringify(prefs));

      return {
        success: true,
        preferences: updatedPrefs,
        message: "Préférences mises à jour avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des préférences:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour des préférences",
      };
    }
  },

  /**
   * Récupérer les préférences utilisateur pour le chatbot
   * @param {string} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getUserPreferences: async (userId = null) => {
    try {
      // Si aucun utilisateur n'est spécifié, utiliser l'utilisateur courant
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message: "Utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        userId = user.id;
      }

      // Récupérer les préférences
      const prefsStr = localStorage.getItem("chatbot_preferences") || "{}";
      const prefs = JSON.parse(prefsStr);

      return {
        success: true,
        preferences: prefs[userId] || {},
        message: "Préférences récupérées avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des préférences:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des préférences",
      };
    }
  },

  /**
   * Récupérer les plannings hebdomadaires
   * @param {string} weekStart - Date de début de la semaine (YYYY-MM-DD)
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getWeeklySchedules: async (weekStart) => {
    try {
      const result = await WeeklyScheduleService.getByWeek(weekStart);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        schedules: result.schedules,
        message: "Plannings hebdomadaires récupérés avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
      };
    }
  },

  /**
   * Recherche d'informations dans la documentation
   * @param {string} query - Requête de recherche
   * @returns {Promise<Object>} - Résultat de la recherche
   */
  searchInfo: async (query) => {
    try {
      // Construction d'une base de connaissances locale simple
      const helpTopics = {
        planning: {
          title: "Gestion des plannings",
          content:
            "La gestion des plannings vous permet de créer et gérer les horaires de travail de vos employés. Vous pouvez générer automatiquement des plannings, les modifier manuellement, et les exporter en PDF.",
          related: ["horaires", "génération automatique", "export PDF"],
        },
        congés: {
          title: "Gestion des congés",
          content:
            "La gestion des congés permet de créer, approuver ou refuser des demandes de congés. Vous pouvez voir le calendrier des congés et vérifier les disponibilités.",
          related: ["vacances", "absences", "RTT", "jours fériés"],
        },
        employés: {
          title: "Gestion des employés",
          content:
            "La gestion des employés vous permet d'ajouter, modifier ou supprimer des employés. Vous pouvez également consulter leurs informations personnelles, leur historique et leurs statistiques.",
          related: ["personnel", "équipe", "utilisateurs", "collaborateurs"],
        },
        statistiques: {
          title: "Statistiques et rapports",
          content:
            "Le module de statistiques vous donne une vision d'ensemble de votre activité avec des graphiques sur les heures travaillées, les absences, et d'autres indicateurs.",
          related: ["graphiques", "analyses", "KPIs", "tableau de bord"],
        },
        rappels: {
          title: "Rappels et notifications",
          content:
            "Le système de rappels vous permet de programmer des alertes pour ne pas oublier des événements importants liés à votre planning ou à vos employés.",
          related: ["alertes", "notifications", "programmation"],
        },
        préférences: {
          title: "Préférences utilisateur",
          content:
            "Les préférences vous permettent de personnaliser votre expérience avec l'application, y compris les paramètres du chatbot.",
          related: ["paramètres", "configuration", "personnalisation"],
        },
      };

      // Recherche simple basée sur des mots-clés
      const normalizedQuery = query.toLowerCase();
      const results = [];

      for (const [key, topic] of Object.entries(helpTopics)) {
        // Vérifier si la requête contient le mot-clé ou l'un des termes associés
        if (
          normalizedQuery.includes(key) ||
          topic.related.some((term) => normalizedQuery.includes(term))
        ) {
          results.push(topic);
        }
      }

      // Si aucun résultat spécifique, retourner une aide générale
      if (results.length === 0) {
        return {
          success: true,
          results: [
            {
              title: "Aide générale",
              content:
                "Smart Planning est une application de gestion de plannings, employés et congés. Vous pouvez demander de l'aide sur des fonctionnalités spécifiques comme 'plannings', 'congés', 'employés', 'statistiques', etc.",
            },
          ],
          message: "Informations générales sur l'application",
        };
      }

      return {
        success: true,
        results,
        message: `${results.length} résultat(s) trouvé(s) pour votre recherche`,
      };
    } catch (error) {
      console.error("Erreur lors de la recherche d'informations:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la recherche d'informations",
      };
    }
  },

  /**
   * Obtenir de l'aide sur les fonctionnalités du chatbot
   * @returns {Promise<Object>} - Informations d'aide
   */
  getHelpInfo: async () => {
    try {
      // Liste des fonctionnalités du chatbot
      const helpInfo = {
        features: [
          {
            name: "Gestion des plannings",
            commands: [
              "Générer un planning pour la semaine prochaine",
              "Afficher mon planning",
              "Optimiser le planning de l'équipe",
              "Voir le planning de la semaine du 15 avril",
            ],
          },
          {
            name: "Gestion des congés",
            commands: [
              "Puis-je poser des congés du 10 au 15 août ?",
              "Je voudrais poser un jour de RTT vendredi prochain",
              "Créer une demande de congés pour 2 semaines en juillet",
              "Quels sont mes jours de congés disponibles ?",
            ],
          },
          {
            name: "Statistiques et rapports",
            commands: [
              "Afficher mes statistiques du mois",
              "Quel est mon bilan d'heures sur l'année ?",
              "Statistiques de l'équipe pour le trimestre",
            ],
          },
          {
            name: "Gestion des employés",
            commands: [
              "Liste des employés disponibles demain",
              "Afficher l'équipe",
              "Qui travaille ce weekend ?",
            ],
          },
          {
            name: "Rappels et notifications",
            commands: [
              "Rappelle-moi la réunion de demain",
              "Créer un rappel pour jeudi à 14h",
              "N'oublie pas de me notifier pour les nouvelles demandes de congés",
            ],
          },
          {
            name: "Préférences et personnalisation",
            commands: [
              "Changer mes préférences",
              "Je préfère les notifications par email",
              "Configurer le chatbot",
            ],
          },
          {
            name: "Recherche d'informations",
            commands: [
              "Comment créer un planning ?",
              "Explique-moi comment gérer les congés",
              "C'est quoi un RTT ?",
            ],
          },
          {
            name: "Feedback",
            commands: [
              "J'ai un problème avec le planning",
              "Suggestion d'amélioration",
              "Signaler un bug",
            ],
          },
        ],
      };

      return {
        success: true,
        helpInfo,
        message: "Informations d'aide récupérées avec succès",
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations d'aide:",
        error
      );
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des informations d'aide",
      };
    }
  },

  /**
   * Obtenir les informations détaillées d'un employé
   * @param {string} employeeIdOrEmail - ID ou email de l'employé
   * @returns {Promise<Object>} - Résultat de la récupération
   */
  getEmployeeInfo: async (employeeIdOrEmail) => {
    try {
      // Si aucun identifiant n'est fourni, utiliser l'utilisateur courant
      if (!employeeIdOrEmail) {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          return {
            success: false,
            message:
              "Identifiant employé non spécifié et utilisateur non connecté",
          };
        }

        const user = JSON.parse(userStr);
        employeeIdOrEmail = user.id || user.email;
      }

      // Vérifier si c'est un email
      const isEmail = employeeIdOrEmail.includes("@");

      // Récupérer la liste complète des employés
      const result = await EmployeeService.getAll();

      if (!result.success) {
        return {
          success: false,
          message: "Impossible de récupérer les informations des employés",
        };
      }

      // Trouver l'employé par son ID ou email
      const employee = result.employees.find((emp) =>
        isEmail
          ? emp.email.toLowerCase() === employeeIdOrEmail.toLowerCase()
          : emp.id === employeeIdOrEmail
      );

      if (!employee) {
        return {
          success: false,
          message: "Employé non trouvé",
        };
      }

      return {
        success: true,
        employee,
        message: "Informations de l'employé récupérées avec succès",
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de l'employé:",
        error
      );
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des informations de l'employé",
      };
    }
  },

  /**
   * Obtenir la liste des employés avec des informations détaillées
   * @returns {Promise<Object>} - Résultat de la récupération avec les employés formatés
   */
  getEmployeesWithDetails: async () => {
    try {
      // Récupérer la liste complète des employés
      const result = await EmployeeService.getAll();

      if (!result.success) {
        return {
          success: false,
          message: "Impossible de récupérer les informations des employés",
        };
      }

      // Formater les données des employés pour inclure des informations supplémentaires
      const formattedEmployees = result.employees.map((employee) => ({
        id: employee.id,
        firstName: employee.first_name || employee.firstName || "",
        lastName: employee.last_name || employee.lastName || "",
        email: employee.email || "",
        role: employee.role || "Employé",
        department: employee.department || "Non spécifié",
        hireDate: employee.hire_date || employee.hireDate || "2021-01-01",
        hours: employee.hours || 35,
        preferredDays: employee.preferred_days ||
          employee.preferredDays || [
            "Lundi",
            "Mardi",
            "Mercredi",
            "Jeudi",
            "Vendredi",
          ],
      }));

      return {
        success: true,
        employees: formattedEmployees,
        message: "Liste détaillée des employés récupérée avec succès",
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails des employés:",
        error
      );
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des détails des employés",
      };
    }
  },
};

export default ChatbotService;
