import { API_ENDPOINTS, apiRequest } from "../config/api";
import { formatDateForAPI } from "../utils/dateUtils";
import { formatError } from "../utils/errorHandling";

/**
 * Configuration et utilitaires pour les appels API
 */

// Constante pour activer/désactiver les logs de débogage API
export const API_DEBUG = true;

/**
 * Fonction utilitaire pour normaliser les réponses API
 * Assure que les réponses ont toujours la structure { success, message, data }
 * @param {*} response - La réponse à normaliser
 * @returns {Object} - Réponse normalisée
 */
const normalizeResponse = (response) => {
  // Cas d'erreur
  if (!response) {
    return { success: false, message: "Aucune réponse reçue", data: null };
  }

  // Si la réponse a déjà la structure attendue
  if (typeof response.success === "boolean") {
    // S'assurer que le message est une chaîne
    const message =
      response.message ||
      (response.success ? "Opération réussie" : "Erreur lors de l'opération");

    return {
      success: response.success,
      message: typeof message === "string" ? message : String(message),
      data: response.data || null,
      error: response.error ? formatError(response.error) : null,
    };
  }

  // Si la réponse est un objet direct (ancienne API)
  return {
    success: true,
    message: "Opération réussie",
    data: response,
  };
};

export const AuthService = {
  login: async (email, password) => {
    console.log("🔐 Tentative de connexion avec:", { email, password: "***" });
    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, "POST", {
        email,
        password,
      });

      if (response.error) {
        console.error("❌ Erreur de connexion:", response.error);
        return { success: false, message: response.error };
      }

      if (response.token) {
        console.log("✅ Connexion réussie, token reçu");
        localStorage.setItem("token", response.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.id,
            email: response.email,
            role: response.role,
            first_name: response.first_name,
            last_name: response.last_name,
          })
        );
        return { success: true, user: response };
      } else {
        console.error("❌ Connexion échouée: pas de token reçu");
        return { success: false, message: "Erreur d'authentification" };
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      return {
        success: false,
        message: error.message || "Erreur de connexion",
      };
    }
  },

  me: async (token) => {
    try {
      console.log("🔍 Récupération des infos du profil utilisateur");
      const response = await apiRequest("/user/profile", "GET");
      if (response.error) {
        return { success: false, message: response.error };
      }
      return { success: true, user: response };
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du profil",
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.REGISTER, "POST", {
        ...userData,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, user: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur d'inscription",
      };
    }
  },

  logout: async () => {
    try {
      // Appeler l'API de déconnexion
      await apiRequest(API_ENDPOINTS.LOGOUT, "POST", {});

      // Supprimer les cookies côté client
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "connect.sid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";

      // Supprimer les informations locales
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  },

  requestAccountDeletion: async () => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTH.REQUEST_ACCOUNT_DELETION,
        "POST"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return {
        success: true,
        message: "Un email de confirmation a été envoyé à votre adresse email.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la demande de suppression de compte",
      };
    }
  },

  confirmAccountDeletion: async (token) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTH.CONFIRM_ACCOUNT_DELETION,
        "POST",
        { token }
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      // Déconnexion après suppression réussie
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        success: true,
        message: "Votre compte a été supprimé avec succès.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la confirmation de suppression de compte",
      };
    }
  },
};

export const EmployeeService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.EMPLOYEES.BASE, "GET");
      return normalizeResponse(response);
    } catch (error) {
      console.error("Erreur EmployeeService.getAll:", error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BY_ID(id),
        "GET"
      );
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Erreur EmployeeService.getById(${id}):`, error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  create: async (employeeData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BASE,
        "POST",
        employeeData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employee: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'employé",
      };
    }
  },

  update: async (id, employeeData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BY_ID(id),
        "PUT",
        employeeData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employee: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'employé",
      };
    }
  },

  delete: async (id) => {
    try {
      console.log(`Suppression du planning ${id}...`);
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "DELETE"
      );

      console.log(`Réponse de la suppression du planning ${id}:`, response);

      // Gérer les erreurs spécifiques retournées avec un code 4xx/5xx
      if (response && response.success === false) {
        console.error(
          `Erreur de suppression du planning ${id}:`,
          response.message
        );
        return {
          success: false,
          message:
            response.message || "Erreur lors de la suppression du planning",
        };
      }

      return { success: true };
    } catch (error) {
      console.error(
        `Erreur d'API lors de la suppression du planning ${id}:`,
        error
      );
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du planning",
      };
    }
  },
};

export const VacationService = {
  getAll: async () => {
    try {
      console.log("VacationService.getAll - Appel de l'API");

      // Récupérer le token et l'utilisateur du localStorage pour le débogage
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");
      let user = null;
      try {
        user = JSON.parse(userString);
        console.log("VacationService.getAll - Utilisateur courant:", user);
      } catch (e) {
        console.error(
          "VacationService.getAll - Erreur parsing utilisateur:",
          e
        );
      }

      console.log(
        "VacationService.getAll - Envoi de la requête avec token:",
        token ? token.substring(0, 15) + "..." : "non défini"
      );

      // Utiliser apiRequest au lieu de fetch direct pour garantir la construction d'URL correcte
      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS.BASE,
        "GET",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      // Si la réponse est directement du JSON, la normaliser et la retourner
      if (response) {
        console.log("VacationService.getAll - Données JSON:", response);
        return normalizeResponse(response);
      } else {
        console.error("VacationService.getAll - Aucune donnée reçue");
        return { success: false, message: "Aucune donnée reçue" };
      }
    } catch (error) {
      console.error("VacationService.getAll - Erreur:", error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS.BY_ID(id),
        "GET"
      );
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Erreur VacationService.getById(${id}):`, error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  create: async (vacationData) => {
    try {
      console.log("VacationService.create - Données reçues:", vacationData);

      // Validation complète des données
      if (!vacationData) {
        throw new Error("Aucune donnée fournie");
      }

      // S'assurer que les identifiants sont des nombres
      let employee_id;
      try {
        employee_id = parseInt(vacationData.employee_id, 10);
      } catch (e) {
        console.error("Erreur de conversion de employee_id:", e);
        employee_id = null;
      }

      if (isNaN(employee_id) || employee_id === null) {
        console.error(
          "Erreur: employee_id n'est pas un nombre valide",
          vacationData.employee_id
        );
        return {
          success: false,
          message: "L'identifiant de l'employé doit être un nombre valide",
        };
      }

      // Préparer un objet de données propre pour l'API
      // Inclure uniquement les champs nécessaires et avec les types appropriés
      const cleanData = {
        employee_id: employee_id,
        creator_id: vacationData.creator_id
          ? parseInt(vacationData.creator_id, 10)
          : null,
        type: vacationData.type || "paid",
        reason: vacationData.reason || "",
      };

      // Formater les dates au format ISO si ce n'est pas déjà fait
      if (vacationData.start_date) {
        cleanData.start_date = formatDateForAPI(vacationData.start_date);
      }
      if (vacationData.end_date) {
        cleanData.end_date = formatDateForAPI(vacationData.end_date);
      }

      // Vérification des champs obligatoires
      const requiredFields = ["employee_id", "start_date", "end_date", "type"];
      const missingFields = requiredFields.filter((field) => {
        const value = cleanData[field];
        return (
          value === undefined ||
          value === null ||
          value === "" ||
          (field === "employee_id" && isNaN(value))
        );
      });

      if (missingFields.length > 0) {
        console.error("Champs obligatoires manquants:", missingFields);
        return {
          success: false,
          message: `Les champs suivants sont obligatoires: ${missingFields.join(
            ", "
          )}`,
        };
      }

      console.log(
        "VacationService.create - Données validées et formatées:",
        cleanData
      );

      // Envoyer la requête à l'API avec les données propres
      try {
        const response = await apiRequest(
          API_ENDPOINTS.VACATIONS.BASE,
          "POST",
          cleanData
        );

        // Vérifier si la réponse contient insertId et l'ajouter à id si nécessaire
        if (response && (response.insertId || response.data?.insertId)) {
          if (!response.id) {
            response.id = response.insertId || response.data?.insertId;
          }
        }

        return normalizeResponse(response);
      } catch (apiError) {
        console.error("Erreur API lors de la création:", apiError);

        // Si l'API a retourné une erreur 500 mais la demande a quand même été créée
        // Tenter de vérifier si elle existe en récupérant toutes les demandes
        if (
          apiError.status === 500 &&
          apiError.message &&
          apiError.message.includes("Column count")
        ) {
          console.log(
            "Tentative de vérification si la demande a été créée malgré l'erreur SQL..."
          );
          try {
            const allVacations = await VacationService.getAll();
            if (
              allVacations &&
              allVacations.success &&
              Array.isArray(allVacations.data)
            ) {
              // Vérifier si une demande récente correspondant aux critères existe
              const recentVacation = allVacations.data.find(
                (v) =>
                  v.employee_id === employee_id &&
                  v.start_date === cleanData.start_date &&
                  v.end_date === cleanData.end_date
              );

              if (recentVacation) {
                console.log(
                  "La demande a été créée malgré l'erreur SQL:",
                  recentVacation
                );
                return {
                  success: true,
                  message:
                    "Demande créée avec succès (malgré une erreur technique)",
                  data: recentVacation,
                  id: recentVacation.id,
                };
              }
            }
          } catch (checkError) {
            console.error("Erreur lors de la vérification:", checkError);
          }
        }

        throw apiError; // Relancer l'erreur si nous n'avons pas pu récupérer la demande
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création de la demande de congé:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la création de la demande de congé",
      };
    }
  },

  update: async (id, vacationData) => {
    try {
      const formattedData = {
        ...vacationData,
        start_date: formatDateForAPI(
          vacationData.startDate || vacationData.start_date
        ),
        end_date: formatDateForAPI(
          vacationData.endDate || vacationData.end_date
        ),
      };

      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS.BY_ID(id),
        "PUT",
        formattedData
      );
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Erreur VacationService.update(${id}):`, error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS.BY_ID(id),
        "DELETE"
      );
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Erreur VacationService.delete(${id}):`, error);
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },

  updateStatus: async (id, status, comment = "") => {
    try {
      console.log(
        `VacationService.updateStatus - Début mise à jour du statut:`,
        {
          id,
          status,
          comment,
        }
      );

      // Vérifier que l'ID est valide
      if (!id || isNaN(parseInt(id, 10))) {
        console.error(`ID invalide: ${id}`);
        return {
          success: false,
          message: "ID invalide pour la mise à jour du statut",
        };
      }

      // Vérifier que le statut est valide
      if (!["pending", "approved", "rejected"].includes(status)) {
        console.error(`Statut invalide: ${status}`);
        return {
          success: false,
          message:
            "Statut invalide. Doit être 'pending', 'approved' ou 'rejected'",
        };
      }

      // Création d'un objet de données propre
      const data = {
        status,
        comment: comment || "",
      };

      console.log(`VacationService.updateStatus - Envoi de la requête:`, {
        url: API_ENDPOINTS.VACATIONS.UPDATE_STATUS(id),
        data,
      });

      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS.UPDATE_STATUS(id),
        "PUT",
        data
      );

      console.log(`VacationService.updateStatus - Réponse reçue:`, response);

      return normalizeResponse(response);
    } catch (error) {
      console.error(
        `Erreur VacationService.updateStatus(${id}, ${status}):`,
        error
      );
      return {
        success: false,
        error: formatError(error),
        message: formatError(error),
      };
    }
  },
};

export const ActivityService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.ACTIVITIES.LIST, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activities: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des activités",
      };
    }
  },

  getByUser: async (userId) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.BY_USER(userId),
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activities: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des activités de l'utilisateur",
      };
    }
  },

  create: async (activityData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.CREATE,
        "POST",
        activityData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activity: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'activité",
      };
    }
  },

  update: async (id, activityData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.UPDATE(id),
        "PUT",
        activityData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activity: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'activité",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.DELETE(id),
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression de l'activité",
      };
    }
  },
};

export const WeeklyScheduleService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.WEEKLY_SCHEDULES, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedules: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
      };
    }
  },

  getByWeek: async (weekStart) => {
    try {
      console.log("Récupération des plannings pour la semaine du", weekStart);

      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return { success: false, message: "Date de début de semaine requise" };
      }

      // S'assurer que la date est au format YYYY-MM-DD
      const formattedDate = formatDateForAPI(weekStart);

      console.log(
        "Appel API pour récupérer les plannings de la semaine:",
        formattedDate
      );

      try {
        const response = await apiRequest(
          `${API_ENDPOINTS.WEEKLY_SCHEDULES}/week/${formattedDate}`,
          "GET"
        );

        if (response.error) {
          console.error(
            "Erreur API lors de la récupération des plannings:",
            response.error
          );
          return {
            success: false,
            message: response.error,
            details: response.details || "",
          };
        }

        console.log(
          "Réponse API pour les plannings:",
          JSON.stringify(response).substring(0, 200) + "..."
        );

        // Normaliser la structure de la réponse pour garantir un format cohérent
        if (
          response &&
          response._originalResponse &&
          response._originalResponse.data
        ) {
          // Cas où la réponse contient la structure normalisée avec _originalResponse
          return {
            success: true,
            schedules: Array.isArray(response._originalResponse.data)
              ? response._originalResponse.data
              : [],
          };
        } else if (response && response.data && Array.isArray(response.data)) {
          // Cas où la réponse contient directement un champ data qui est un tableau
          return { success: true, schedules: response.data };
        } else if (Array.isArray(response)) {
          // Cas où la réponse est directement un tableau
          return { success: true, schedules: response };
        } else {
          // Cas par défaut - on retourne une structure attendue avec un tableau vide si nécessaire
          return {
            success: true,
            schedules: response && Array.isArray(response) ? response : [],
          };
        }
      } catch (apiError) {
        console.error("Exception lors de l'appel API:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Exception lors de l'appel API:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
        details: "",
      };
    }
  },

  getByEmployee: async (employeeId) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.EMPLOYEES.SCHEDULES(employeeId)}`,
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedules: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des plannings de l'employé",
      };
    }
  },

  getByEmployeeAndWeek: async (employeeId, weekStart) => {
    try {
      if (!employeeId) {
        console.error("ID employé non spécifié");
        return { success: false, message: "ID employé requis" };
      }

      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return { success: false, message: "Date de début de semaine requise" };
      }

      // S'assurer que la date est au format YYYY-MM-DD
      let formattedDate = weekStart;
      if (weekStart instanceof Date) {
        formattedDate = formatDateForAPI(weekStart);
      } else if (typeof weekStart === "string" && weekStart.includes("T")) {
        // Si la date contient un T (format ISO), extraire seulement la partie date
        formattedDate = weekStart.split("T")[0];
      }

      console.error(
        "Appel API pour récupérer le planning de l'employé:",
        employeeId,
        "semaine du:",
        formattedDate
      );

      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/employee/${employeeId}/week/${formattedDate}`,
        "GET"
      );

      if (response.error) {
        console.error(
          "Erreur API lors de la récupération du planning:",
          response.error
        );
        return { success: false, message: response.error };
      }

      return response; // La réponse contient déjà success et schedule
    } catch (error) {
      console.error("Exception lors de la récupération du planning:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du planning",
      };
    }
  },

  create: async (scheduleData) => {
    try {
      console.log("Création d'un nouveau planning:", scheduleData);

      // Utiliser l'URL complète avec API_URL pour s'assurer que la requête est correctement routée
      const response = await apiRequest(
        API_ENDPOINTS.WEEKLY_SCHEDULES,
        "POST",
        scheduleData
      );

      if (response.error) {
        console.error(
          "Erreur lors de la création du planning:",
          response.error
        );
        return { success: false, message: response.error };
      }

      console.log("Planning créé avec succès:", response);

      // Normaliser la réponse pour s'assurer que tous les champs nécessaires sont présents
      return {
        success: true,
        schedule: response.data || response,
      };
    } catch (error) {
      console.error("Exception lors de la création du planning:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la création du planning",
      };
    }
  },

  // Méthode createSchedule pour cohérence d'API
  createSchedule: async (scheduleData) => {
    return WeeklyScheduleService.create(scheduleData);
  },

  update: async (id, scheduleData) => {
    try {
      console.log(`Mise à jour du planning ${id}:`, scheduleData);
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "PUT",
        scheduleData
      );

      console.log(`Réponse de la mise à jour du planning ${id}:`, response);

      // Gérer les erreurs spécifiques retournées avec un code 4xx/5xx
      if (response && response.success === false) {
        console.error(
          `Erreur de mise à jour du planning ${id}:`,
          response.message
        );
        return {
          success: false,
          message:
            response.message || "Erreur lors de la mise à jour du planning",
          scheduleId: response.scheduleId, // Pour gérer le cas de conflit (planning existant)
        };
      }

      // En cas de succès, la réponse contient l'objet schedule
      if (response && response.schedule) {
        return { success: true, schedule: response.schedule };
      } else if (response && response.success) {
        // Si pas de schedule mais success=true
        return { success: true, schedule: response };
      }

      return { success: true, schedule: response }; // Par défaut, considérer la réponse comme le schedule
    } catch (error) {
      console.error(
        `Erreur d'API lors de la mise à jour du planning ${id}:`,
        error
      );
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du planning",
      };
    }
  },

  // Méthode updateSchedule pour cohérence d'API
  updateSchedule: async (id, scheduleData) => {
    return WeeklyScheduleService.update(id, scheduleData);
  },

  delete: async (id) => {
    try {
      console.log(`Suppression du planning ${id}...`);
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "DELETE"
      );

      console.log(`Réponse de la suppression du planning ${id}:`, response);

      // Gérer les erreurs spécifiques retournées avec un code 4xx/5xx
      if (response && response.success === false) {
        console.error(
          `Erreur de suppression du planning ${id}:`,
          response.message
        );
        return {
          success: false,
          message:
            response.message || "Erreur lors de la suppression du planning",
        };
      }

      return { success: true };
    } catch (error) {
      console.error(
        `Erreur d'API lors de la suppression du planning ${id}:`,
        error
      );
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du planning",
      };
    }
  },

  // Méthode deleteSchedule pour cohérence d'API
  deleteSchedule: async (id) => {
    return WeeklyScheduleService.delete(id);
  },
};

export const HourBalanceService = {
  getByEmployee: async (employeeId) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.HOUR_BALANCE.BY_EMPLOYEE(employeeId),
        "GET"
      );

      if (response && response.error) {
        return { success: false, message: response.error };
      }

      if (response && typeof response.balance !== "undefined") {
        return { success: true, balance: response.balance };
      }

      if (response && typeof response === "object") {
        if (typeof response.hour_balance !== "undefined") {
          return { success: true, balance: response.hour_balance };
        }

        if (
          Object.keys(response).length === 1 &&
          typeof Object.values(response)[0] === "number"
        ) {
          return { success: true, balance: Object.values(response)[0] };
        }
      }

      console.warn(
        `Avertissement: Format de réponse inattendu pour le solde d'heures de l'employé ${employeeId}:`,
        response
      );
      return { success: true, balance: 0 };
    } catch (error) {
      console.warn(
        "Avertissement lors de la récupération du solde d'heures:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération du solde d'heures",
      };
    }
  },

  updateBalance: async (employeeId, balanceData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.HOUR_BALANCE.BY_EMPLOYEE(employeeId),
        "PUT",
        balanceData
      );

      if (response && response.error) {
        return { success: false, message: response.error };
      }

      return {
        success: true,
        balance:
          response.balance ||
          response.hour_balance ||
          (typeof response === "number" ? response : 0),
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du solde d'heures:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour du solde d'heures",
      };
    }
  },
};

export const NotificationService = {
  getNotifications: async (params = {}) => {
    try {
      // Construire l'URL avec les paramètres de requête
      let endpoint = API_ENDPOINTS.NOTIFICATIONS.BASE;
      if (params) {
        const queryParams = new URLSearchParams();
        for (const key in params) {
          if (params[key] !== undefined) {
            queryParams.append(key, params[key]);
          }
        }
        const queryString = queryParams.toString();
        if (queryString) {
          endpoint += `?${queryString}`;
        }
      }

      // Utiliser le bon chemin avec le préfixe /api
      const url = `/api${endpoint}`;
      return await apiRequest(url, "GET");
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  },

  createNotification: async (notificationData) => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.BASE}`;
      return await apiRequest(url, "POST", notificationData);
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
      throw error;
    }
  },

  createBroadcastNotification: async (notificationData) => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.BASE}/broadcast`;
      return await apiRequest(url, "POST", notificationData);
    } catch (error) {
      console.error("Erreur lors de la diffusion des notifications:", error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.BASE}/unread-count`;
      return await apiRequest(url, "GET");
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de notifications non lues:",
        error
      );
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.MARK_READ(
        notificationId
      )}`;
      return await apiRequest(url, "PUT");
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`;
      return await apiRequest(url, "PUT");
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId)}`;
      return await apiRequest(url, "DELETE");
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      throw error;
    }
  },

  deleteAllNotifications: async () => {
    try {
      const url = `/api${API_ENDPOINTS.NOTIFICATIONS.BASE}`;
      return await apiRequest(url, "DELETE");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de toutes les notifications:",
        error
      );
      throw error;
    }
  },
};

export const UserService = {
  /**
   * Récupérer les détails d'un utilisateur par son ID
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Détails de l'utilisateur
   */
  getById: async (userId) => {
    try {
      console.log(
        `Récupération des informations de l'utilisateur ID: ${userId}`
      );
      const response = await apiRequest(`/api/users/${userId}`, "GET");

      return normalizeResponse(response);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur ${userId}:`,
        error
      );
      return {
        success: false,
        message:
          error.message ||
          `Erreur lors de la récupération de l'utilisateur ${userId}`,
      };
    }
  },

  /**
   * Récupérer tous les utilisateurs
   * @returns {Promise<Object>} - Liste des utilisateurs
   */
  getAll: async () => {
    try {
      console.log("Récupération de la liste des utilisateurs");
      const response = await apiRequest("/users", "GET");

      return normalizeResponse(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des utilisateurs",
      };
    }
  },
};
