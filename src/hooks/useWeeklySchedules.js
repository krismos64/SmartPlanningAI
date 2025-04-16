import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import AuthService from "../services/AuthService";
import WeeklyScheduleService from "../services/WeeklyScheduleService";
import { fetchCsrfTokenRobust } from "../utils/api";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 * Utilise WeeklyScheduleService de services/api.js pour les appels API
 */
const useWeeklySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [scheduleCreating, setScheduleCreating] = useState(false);
  const [scheduleUpdating, setScheduleUpdating] = useState(false);
  const [scheduleDeleting, setScheduleDeleting] = useState(false);
  const [schedulesError, setSchedulesError] = useState(null);
  const [scheduleError, setScheduleError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState("");
  // eslint-disable-next-line no-unused-vars
  const { refreshToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  // Intégration WebSocket pour les mises à jour en temps réel
  const { socket, isConnected, notifyDataChange } = useWebSocket();

  // Référence pour suivre si une erreur d'authentification a été détectée
  const authErrorDetected = useRef(false);

  // Référence pour compter les échecs d'authentification consécutifs
  const authFailureCount = useRef(0);

  // Référence pour suivre si une tentative de rafraîchissement a déjà été faite
  const authRefreshAttempted = useRef(false);

  // Référence pour suivre si un rafraîchissement de token est en cours
  const isRefreshingToken = useRef(false);

  // Référence au socket WebSocket
  const socketRef = useRef(null);

  // Référence pour stocker les plannings par semaine
  const schedulesByWeek = useRef({});

  // Référence pour suivre le processus de rafraîchissement du token
  const tokenRefreshInProgress = useRef(false);

  const maxAuthRetries = 2;

  /**
   * Réinitialise les compteurs d'erreurs d'authentification
   */
  const resetAuthCounters = useCallback(() => {
    authFailureCount.current = 0;
    authRefreshAttempted.current = false;
    authErrorDetected.current = false;
  }, []);

  /**
   * Effectue les actions nécessaires en cas d'erreur d'authentification
   */
  const handleAuthenticationError = useCallback(async () => {
    // Éviter les tentatives multiples de refresh simultanées
    if (isRefreshingToken.current) {
      return false;
    }

    authFailureCount.current += 1;
    console.warn(
      `Erreur d'authentification détectée (${authFailureCount.current}/${maxAuthRetries})`
    );

    // Si on a déjà atteint le nombre max de tentatives, déconnecter l'utilisateur
    if (authFailureCount.current > maxAuthRetries) {
      console.error("Nombre maximum de tentatives d'authentification atteint");
      toast.error("Authentification invalide. Vous allez être déconnecté.", {
        id: "auth-error",
      });

      // Signaler l'erreur d'authentification
      authErrorDetected.current = true;

      // Déconnecter l'utilisateur
      setTimeout(() => {
        AuthService.logout();
        navigate("/login");
      }, 2000);

      return false;
    }

    // Tenter de rafraîchir le token via le service
    isRefreshingToken.current = true;

    try {
      console.log(
        "Tentative de rafraîchissement du token via WeeklyScheduleService..."
      );
      const refreshResult = await WeeklyScheduleService.handleAuthError();

      isRefreshingToken.current = false;

      if (refreshResult) {
        console.log("Token rafraîchi avec succès");
        return true;
      } else {
        console.error("Échec du rafraîchissement du token");
        toast.error("Session expirée. Vous allez être déconnecté.", {
          id: "auth-error",
        });

        // Signaler l'erreur d'authentification
        authErrorDetected.current = true;

        // Déconnecter l'utilisateur
        setTimeout(() => {
          AuthService.logout();
          navigate("/login");
        }, 2000);

        return false;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);

      // Signaler l'erreur d'authentification
      authErrorDetected.current = true;

      toast.error(
        "Impossible de restaurer votre session. Vous allez être déconnecté.",
        { id: "auth-error" }
      );

      // Déconnecter l'utilisateur
      setTimeout(() => {
        AuthService.logout();
        navigate("/login");
      }, 2000);

      isRefreshingToken.current = false;
      return false;
    }
  }, [navigate]);

  /**
   * Analyse un objet planning provenant de l'API pour utilisation côté frontend
   * @param {Object} apiSchedule - Données du planning reçues de l'API
   * @returns {Object} - Données formatées pour le frontend
   */
  const parseScheduleFromApi = useCallback((apiSchedule) => {
    if (!apiSchedule) return null;

    // Copier les données pour éviter de modifier l'original
    const parsedSchedule = { ...apiSchedule };

    // Convertir les chaînes de date en objets Date
    if (typeof parsedSchedule.startDate === "string") {
      parsedSchedule.startDate = new Date(parsedSchedule.startDate);
    }
    if (typeof parsedSchedule.endDate === "string") {
      parsedSchedule.endDate = new Date(parsedSchedule.endDate);
    }

    // Convertir les timestamps pour les créations/mises à jour
    if (typeof parsedSchedule.createdAt === "string") {
      parsedSchedule.createdAt = new Date(parsedSchedule.createdAt);
    }
    if (typeof parsedSchedule.updatedAt === "string") {
      parsedSchedule.updatedAt = new Date(parsedSchedule.updatedAt);
    }

    // Formater les shifts si nécessaire
    if (parsedSchedule.shifts && Array.isArray(parsedSchedule.shifts)) {
      parsedSchedule.shifts = parsedSchedule.shifts.map((shift) => ({
        ...shift,
        startTime:
          typeof shift.startTime === "string"
            ? new Date(shift.startTime)
            : shift.startTime,
        endTime:
          typeof shift.endTime === "string"
            ? new Date(shift.endTime)
            : shift.endTime,
      }));
    }

    return parsedSchedule;
  }, []);

  /**
   * Prépare un objet planning pour l'envoi à l'API
   * @param {Object} scheduleData - Données du planning côté frontend
   * @returns {Object} - Données formatées pour l'API
   */
  const prepareScheduleForApi = useCallback((scheduleData) => {
    // Copier les données pour éviter de modifier l'original
    const apiSchedule = { ...scheduleData };

    // Convertir les dates en chaînes ISO si nécessaire
    if (apiSchedule.startDate instanceof Date) {
      apiSchedule.startDate = apiSchedule.startDate.toISOString();
    }
    if (apiSchedule.endDate instanceof Date) {
      apiSchedule.endDate = apiSchedule.endDate.toISOString();
    }

    // Formater les autres champs si nécessaire
    if (apiSchedule.shifts && Array.isArray(apiSchedule.shifts)) {
      apiSchedule.shifts = apiSchedule.shifts.map((shift) => ({
        ...shift,
        startTime:
          shift.startTime instanceof Date
            ? shift.startTime.toISOString()
            : shift.startTime,
        endTime:
          shift.endTime instanceof Date
            ? shift.endTime.toISOString()
            : shift.endTime,
      }));
    }

    return apiSchedule;
  }, []);

  /**
   * Réinitialiser l'état d'authentification et déconnecter l'utilisateur
   */
  const resetAuthState = useCallback(() => {
    console.log("🔄 Réinitialisation de l'état d'authentification");
    authErrorDetected.current = false;
    authFailureCount.current = 0;
    authRefreshAttempted.current = false;

    // Afficher un message à l'utilisateur
    toast.error("Votre session a expiré. Vous allez être déconnecté.");

    // Déconnecter l'utilisateur avec un délai pour permettre l'affichage des messages
    if (logout && typeof logout === "function") {
      setTimeout(() => {
        logout();
      }, 2000);
    }
  }, [logout]);

  /**
   * S'assure que l'authentification est valide avant de faire une requête API
   * Tente de rafraîchir le token si nécessaire
   * @returns {Promise<boolean>} true si l'authentification est valide, false sinon
   */
  const ensureValidAuth = useCallback(async () => {
    // Si une erreur d'authentification a déjà été détectée, ne pas réessayer
    if (authErrorDetected.current) {
      return false;
    }

    // Si on est déjà en train de rafraîchir le token, attendre
    if (isRefreshingToken.current) {
      try {
        // Attendre jusqu'à 3 secondes pour que le rafraîchissement se termine
        let attempts = 0;
        while (isRefreshingToken.current && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        // Si après 3 secondes le rafraîchissement est toujours en cours, abandonner
        if (isRefreshingToken.current) {
          console.error("⏱️ Timeout en attendant le rafraîchissement du token");
          return false;
        }

        // Si on n'a plus d'erreur d'authentification, alors le rafraîchissement a réussi
        return !authErrorDetected.current;
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'attente du rafraîchissement du token:",
          error
        );
        return false;
      }
    }

    try {
      // Vérifier si l'utilisateur est authentifié (si le token est encore valide)
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ Aucun token d'authentification trouvé");
        // Signaler l'erreur d'authentification
        authErrorDetected.current = true;
        toast.error("Veuillez vous connecter pour continuer");
        // Déconnecter l'utilisateur après un délai
        setTimeout(() => {
          AuthService.logout();
          navigate("/login");
        }, 2000);
        return false;
      }

      // Si une tentative de rafraîchissement a déjà échoué précédemment, ne pas réessayer
      if (authRefreshAttempted.current && authFailureCount.current > 0) {
        console.warn(
          "⚠️ Une tentative de rafraîchissement a déjà échoué, abandon"
        );
        return false;
      }

      // Tenter de rafraîchir le token si on a déjà détecté des problèmes d'authentification
      if (authFailureCount.current > 0) {
        isRefreshingToken.current = true;
        console.log("🔄 Tentative de rafraîchissement du token...");

        try {
          // Appeler l'API pour rafraîchir le token
          const refreshResponse = await AuthService.refreshToken();

          if (refreshResponse.success) {
            console.log("✅ Token rafraîchi avec succès");
            // Réinitialiser les compteurs d'erreur
            authFailureCount.current = 0;
            authRefreshAttempted.current = true;
            isRefreshingToken.current = false;
            return true;
          } else {
            console.error("❌ Échec du rafraîchissement du token");
            // Signaler l'erreur d'authentification
            authErrorDetected.current = true;
            toast.error("Session expirée, veuillez vous reconnecter");
            // Déconnecter l'utilisateur
            setTimeout(() => {
              AuthService.logout();
              navigate("/login");
            }, 2000);
            isRefreshingToken.current = false;
            return false;
          }
        } catch (refreshError) {
          console.error(
            "❌ Erreur lors du rafraîchissement du token:",
            refreshError
          );
          // Signaler l'erreur d'authentification
          authErrorDetected.current = true;
          toast.error(
            "Impossible de restaurer votre session, veuillez vous reconnecter"
          );
          // Déconnecter l'utilisateur
          setTimeout(() => {
            AuthService.logout();
            navigate("/login");
          }, 2000);
          isRefreshingToken.current = false;
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la vérification de l'authentification:",
        error
      );
      // Signaler l'erreur d'authentification
      authErrorDetected.current = true;
      toast.error("Problème d'authentification, veuillez vous reconnecter");
      // Déconnecter l'utilisateur
      setTimeout(() => {
        AuthService.logout();
        navigate("/login");
      }, 2000);
      return false;
    }
  }, [navigate]);

  // Écouter les mises à jour WebSocket
  useEffect(() => {
    if (socket && isConnected) {
      // Fonction pour traiter les messages WebSocket
      const handleWebSocketMessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Si le message concerne une mise à jour de planning
          if (data.type === "SCHEDULE_UPDATED" && data.schedule) {
            setSchedules((prevSchedules) => {
              // Vérifier si le planning existe déjà
              const exists = prevSchedules.some(
                (schedule) => schedule.id === data.schedule.id
              );

              if (exists) {
                // Mettre à jour le planning existant
                return prevSchedules.map((schedule) =>
                  schedule.id === data.schedule.id
                    ? parseScheduleFromApi(data.schedule)
                    : schedule
                );
              } else {
                // Ajouter le nouveau planning
                return [...prevSchedules, parseScheduleFromApi(data.schedule)];
              }
            });

            toast.info("Planning mis à jour en temps réel");
          }

          // Si le message concerne une suppression de planning
          if (data.type === "SCHEDULE_DELETED" && data.scheduleId) {
            setSchedules((prevSchedules) =>
              prevSchedules.filter(
                (schedule) => schedule.id !== data.scheduleId
              )
            );

            toast.info("Planning supprimé en temps réel");
          }
        } catch (error) {
          console.error(
            "Erreur lors du traitement du message WebSocket:",
            error
          );
        }
      };

      // Ajouter l'écouteur d'événements
      socket.addEventListener("message", handleWebSocketMessage);

      // Nettoyer l'écouteur lors du démontage
      return () => {
        socket.removeEventListener("message", handleWebSocketMessage);
      };
    }
  }, [socket, isConnected]);

  /**
   * Récupérer les plannings pour une semaine donnée
   */
  const fetchSchedulesByWeek = useCallback(
    async (weekStartDate, force = false) => {
      if (!weekStartDate) return;

      const dateKey = format(new Date(weekStartDate), "yyyy-MM-dd");

      // Éviter de charger plusieurs fois la même semaine sauf si force=true
      if (
        !force &&
        schedulesByWeek.current[dateKey] &&
        schedulesByWeek.current[dateKey].length > 0
      ) {
        console.log(
          `📅 Utilisation des données en cache pour la semaine du ${dateKey}`
        );
        return { schedules: schedulesByWeek.current[dateKey], fromCache: true };
      }

      setSchedulesLoading(true);
      setSchedulesError(null);

      try {
        // Vérifier l'authentification avant de faire la requête
        const isAuthValid = await ensureValidAuth();
        if (!isAuthValid) {
          throw new Error("Erreur d'authentification");
        }

        const response = await WeeklyScheduleService.getSchedules(
          weekStartDate
        );

        if (response.success) {
          const schedules = response.data || [];
          // Transformer les données au format attendu par le frontend si nécessaire
          const parsedSchedules = parseScheduleFromApi
            ? schedules.map((schedule) => parseScheduleFromApi(schedule))
            : schedules;

          schedulesByWeek.current[dateKey] = parsedSchedules;
          setSchedules(parsedSchedules);
          setSchedulesLoading(false);
          return { schedules: parsedSchedules, fromCache: false };
        } else {
          throw new Error(
            response.message || "Erreur lors du chargement des plannings"
          );
        }
      } catch (error) {
        const errorMessage =
          error.message || "Erreur lors du chargement des plannings";
        console.error("❌ Erreur fetchSchedulesByWeek:", errorMessage);
        setSchedulesError(errorMessage);
        setSchedulesLoading(false);

        // Afficher un toast uniquement si ce n'est pas une erreur d'authentification
        if (!authErrorDetected.current) {
          toast.error(errorMessage);
        }

        return { schedules: [], fromCache: false, error: errorMessage };
      }
    },
    [schedulesByWeek, ensureValidAuth, parseScheduleFromApi]
  );

  /**
   * Enregistrer ou mettre à jour un planning
   * @param {Object} scheduleData - Le planning à sauvegarder
   * @returns {Promise<Object>} - Le planning sauvegardé
   */
  const saveSchedule = useCallback(
    async (scheduleData) => {
      if (!isAuthenticated) {
        console.warn(
          "Tentative de sauvegarde d'un planning sans authentification"
        );
        toast.error("Vous devez être connecté pour enregistrer un planning");
        return { success: false };
      }

      // Réinitialiser les compteurs avant chaque nouvelle requête
      resetAuthCounters();

      try {
        setScheduleCreating(true);
        setScheduleError(null);

        // Vérifier l'authentification avant de faire l'appel API
        const isAuthValid = await ensureValidAuth();
        if (!isAuthValid) {
          console.warn("Authentification invalide détectée avant l'appel API");
          return {
            success: false,
            message: "Authentification invalide. Veuillez vous reconnecter.",
          };
        }

        // Assurons-nous d'avoir un CSRF token valide
        await fetchCsrfTokenRobust();

        // Préparer les données pour l'API
        let result;
        if (scheduleData.id) {
          console.log("Mise à jour du planning existant:", scheduleData.id);
          result = await WeeklyScheduleService.updateSchedule(
            scheduleData.id,
            scheduleData
          );
        } else {
          console.log("Création d'un nouveau planning");
          result = await WeeklyScheduleService.createSchedule(scheduleData);
        }

        if (result.success) {
          console.log("Planning enregistré avec succès:", result.data);

          // Mettre à jour la liste des plannings
          setSchedules((prevSchedules) => {
            const parsedSchedule = parseScheduleFromApi(result.data);

            // Si le planning existe déjà, le remplacer
            if (parsedSchedule.id) {
              const exists = prevSchedules.some(
                (s) => s.id === parsedSchedule.id
              );
              if (exists) {
                return prevSchedules.map((schedule) =>
                  schedule.id === parsedSchedule.id ? parsedSchedule : schedule
                );
              }
            }

            // Sinon, ajouter le nouveau planning
            return [...prevSchedules, parsedSchedule];
          });

          // Notifier les autres clients via WebSocket si nécessaire
          if (notifyDataChange) {
            notifyDataChange({
              type: scheduleData.id ? "SCHEDULE_UPDATED" : "SCHEDULE_CREATED",
              week: currentWeek,
              schedule: result.data,
            });
          }

          toast.success(
            scheduleData.id
              ? "Planning mis à jour avec succès"
              : "Planning créé avec succès"
          );

          return { success: true, data: result.data };
        } else {
          console.error(
            "Erreur lors de l'enregistrement du planning:",
            result.message
          );

          // Gérer spécifiquement les erreurs d'authentification
          if (result.statusCode === 401) {
            // Gérer l'erreur d'authentification
            const authResult = await handleAuthenticationError();

            // Si l'authentification a été réparée, réessayer la sauvegarde
            if (authResult) {
              console.log(
                "Nouvelle tentative de sauvegarde après rafraîchissement du token"
              );
              return await saveSchedule(scheduleData);
            }
          } else {
            setScheduleError(
              result.message || "Erreur lors de l'enregistrement du planning"
            );
            toast.error(
              result.message || "Erreur lors de l'enregistrement du planning"
            );
          }

          return result;
        }
      } catch (error) {
        console.error("Exception lors de l'enregistrement du planning:", error);

        // Vérifier spécifiquement les erreurs d'authentification 401
        if (error?.response?.status === 401) {
          authFailureCount.current += 1;
          console.warn(
            `Erreur d'authentification 401 capturée (${authFailureCount.current})`
          );

          // Tentative de rafraîchissement du token
          if (!authRefreshAttempted.current && authFailureCount.current <= 2) {
            authRefreshAttempted.current = true;
            console.log(
              "Tentative de rafraîchissement du token après erreur..."
            );

            try {
              const refreshResult = await AuthService.refreshToken();
              if (refreshResult) {
                console.log(
                  "Token rafraîchi avec succès après erreur, nouvel essai..."
                );
                authFailureCount.current = 0;
                authRefreshAttempted.current = false;
                // Réessayer l'opération
                return saveSchedule(scheduleData);
              } else {
                authErrorDetected.current = true;
                toast.error(
                  "Authentification invalide. Veuillez vous reconnecter."
                );
              }
            } catch (refreshError) {
              console.error(
                "Échec du rafraîchissement après erreur:",
                refreshError
              );
              authErrorDetected.current = true;
              toast.error("Session expirée. Veuillez vous reconnecter.");
            }
          } else {
            authErrorDetected.current = true;
            toast.error("Session expirée. Veuillez vous reconnecter.");
          }
        } else {
          setScheduleError("Une erreur est survenue lors de l'enregistrement");
          toast.error("Erreur lors de l'enregistrement du planning");
        }

        return {
          success: false,
          message: error?.message || "Erreur inconnue lors de l'enregistrement",
        };
      } finally {
        setScheduleCreating(false);
      }
    },
    [
      isAuthenticated,
      ensureValidAuth,
      parseScheduleFromApi,
      notifyDataChange,
      currentWeek,
      resetAuthCounters,
      handleAuthenticationError,
    ]
  );

  /**
   * Supprime un planning
   * @param {string} scheduleId - ID du planning à supprimer
   * @param {string} weekStart - Date de début de semaine (pour notification WebSocket)
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  const deleteSchedule = useCallback(
    async (scheduleId) => {
      if (!isAuthenticated || !scheduleId) {
        console.warn(
          "Tentative de suppression d'un planning sans authentification ou sans ID"
        );
        return { success: false };
      }

      // Réinitialiser les compteurs avant chaque nouvelle requête
      resetAuthCounters();

      try {
        setScheduleDeleting(true);
        setScheduleError(null);

        console.log(`Suppression du planning: ${scheduleId}`);

        const result = await WeeklyScheduleService.deleteSchedule(scheduleId);

        if (result.success) {
          console.log("Planning supprimé avec succès");

          // Mettre à jour la liste des plannings
          setSchedules((prevSchedules) =>
            prevSchedules.filter((schedule) => schedule.id !== scheduleId)
          );

          // Notifier les autres clients via WebSocket si nécessaire
          if (notifyDataChange) {
            notifyDataChange({
              type: "SCHEDULE_DELETED",
              scheduleId,
              week: currentWeek,
            });
          }

          toast.success("Planning supprimé avec succès");
          return { success: true };
        } else {
          console.error(
            "Erreur lors de la suppression du planning:",
            result.message
          );

          // Gérer spécifiquement les erreurs d'authentification
          if (result.statusCode === 401) {
            // Gérer l'erreur d'authentification
            const authResult = await handleAuthenticationError();

            // Si l'authentification a été réparée, réessayer la suppression
            if (authResult) {
              console.log(
                "Nouvelle tentative de suppression après rafraîchissement du token"
              );
              return await deleteSchedule(scheduleId);
            }
          }

          setScheduleError(
            result.message || "Erreur lors de la suppression du planning"
          );
          toast.error(
            result.message || "Erreur lors de la suppression du planning"
          );
          return { success: false, message: result.message };
        }
      } catch (error) {
        console.error("Exception lors de la suppression du planning:", error);
        setScheduleError(
          error.message || "Erreur réseau lors de la suppression du planning"
        );
        toast.error(
          error.message || "Erreur réseau lors de la suppression du planning"
        );
        return { success: false, message: error.message };
      } finally {
        setScheduleDeleting(false);
      }
    },
    [
      isAuthenticated,
      currentWeek,
      notifyDataChange,
      resetAuthCounters,
      handleAuthenticationError,
    ]
  );

  // Définir la semaine actuelle et charger les plannings
  const setWeek = useCallback(
    (week) => {
      setCurrentWeek(week);
      fetchSchedulesByWeek(new Date(week));
    },
    [fetchSchedulesByWeek]
  );

  // Effectuer un chargement initial au montage du composant
  useEffect(() => {
    if (currentWeek) {
      fetchSchedulesByWeek(new Date(currentWeek));
    }
  }, [currentWeek, fetchSchedulesByWeek]);

  // Écouter les événements WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!socket) return;

    const handleWebSocketUpdate = (data) => {
      console.log("🔄 Mise à jour WebSocket reçue:", data);

      // Si la mise à jour concerne la semaine actuelle, recharger les plannings
      if (data && data.week === currentWeek) {
        fetchSchedulesByWeek(new Date(data.week));
      }
    };

    // S'abonner aux événements
    socket.on("schedule_created", handleWebSocketUpdate);
    socket.on("schedule_updated", handleWebSocketUpdate);
    socket.on("schedule_deleted", handleWebSocketUpdate);

    // Nettoyer les abonnements lors du démontage
    return () => {
      socket.off("schedule_created", handleWebSocketUpdate);
      socket.off("schedule_updated", handleWebSocketUpdate);
      socket.off("schedule_deleted", handleWebSocketUpdate);
    };
  }, [socket, currentWeek, fetchSchedulesByWeek]);

  /**
   * Créer un nouveau planning
   */
  const createSchedule = useCallback(
    async (scheduleData, onSuccess) => {
      setScheduleCreating(true);
      setScheduleError(null);

      try {
        console.log("useWeeklySchedules.createSchedule - Début", scheduleData);

        // Vérifier l'authentification avant de faire la requête
        const isAuthValid = await ensureValidAuth();
        if (!isAuthValid) {
          throw new Error("Erreur d'authentification");
        }

        // Préparer les données pour l'API si nécessaire
        const apiSchedule = prepareScheduleForApi
          ? prepareScheduleForApi(scheduleData)
          : scheduleData;

        const response = await WeeklyScheduleService.createSchedule(
          apiSchedule
        );

        if (response.success) {
          const schedule = response.data;
          // Transformer les données au format attendu par le frontend si nécessaire
          const parsedSchedule = parseScheduleFromApi
            ? parseScheduleFromApi(schedule)
            : schedule;

          const dateKey = format(
            new Date(parsedSchedule.weekStartDate),
            "yyyy-MM-dd"
          );

          // Mettre à jour le cache local
          schedulesByWeek.current[dateKey] = [
            ...(schedulesByWeek.current[dateKey] || []),
            parsedSchedule,
          ];

          setSchedules((prev) => [...prev, parsedSchedule]);
          setScheduleCreating(false);
          toast.success("Planning créé avec succès!");

          // Appeler le callback onSuccess si fourni
          if (onSuccess && typeof onSuccess === "function") {
            onSuccess(parsedSchedule);
          }

          return { success: true, schedule: parsedSchedule };
        } else {
          console.error("useWeeklySchedules.createSchedule - Échec", response);

          // Gérer l'erreur d'authentification
          if (response.statusCode === 401) {
            if (!authErrorDetected.current) {
              authErrorDetected.current = true;
              toast.error("Session expirée. Veuillez vous reconnecter.");
              // Rediriger vers la page de connexion après un court délai
              setTimeout(() => {
                navigate("/login?expired=true");
              }, 2000);
            }
          } else {
            setScheduleError(
              response.message || "Erreur lors de la création du planning"
            );
            toast.error(
              response.message || "Erreur lors de la création du planning"
            );
          }

          return { success: false, error: response.message };
        }
      } catch (error) {
        console.error("useWeeklySchedules.createSchedule - Exception", error);
        setScheduleError("Erreur lors de la création du planning");
        toast.error("Erreur lors de la création du planning");
        return { success: false, message: "Erreur interne" };
      } finally {
        setScheduleCreating(false);
      }
    },
    [ensureValidAuth, prepareScheduleForApi, parseScheduleFromApi, navigate]
  );

  /**
   * Mettre à jour un planning existant
   */
  const updateSchedule = useCallback(
    async (scheduleId, scheduleData, onSuccess) => {
      setScheduleUpdating(true);
      setScheduleError(null);

      try {
        console.log(
          "useWeeklySchedules.updateSchedule - Début",
          scheduleId,
          scheduleData
        );

        // Vérifier l'authentification avant de faire la requête
        const isAuthValid = await ensureValidAuth();
        if (!isAuthValid) {
          throw new Error("Erreur d'authentification");
        }

        // Préparer les données pour l'API si nécessaire
        const apiSchedule = prepareScheduleForApi
          ? prepareScheduleForApi(scheduleData)
          : scheduleData;

        const response = await WeeklyScheduleService.updateSchedule(
          scheduleId,
          apiSchedule
        );

        if (response.success) {
          const schedule = response.data;
          // Transformer les données au format attendu par le frontend si nécessaire
          const updatedSchedule = parseScheduleFromApi
            ? parseScheduleFromApi(schedule)
            : schedule;

          const dateKey = format(
            new Date(updatedSchedule.weekStartDate),
            "yyyy-MM-dd"
          );

          // Mettre à jour le cache local
          if (schedulesByWeek.current[dateKey]) {
            schedulesByWeek.current[dateKey] = schedulesByWeek.current[
              dateKey
            ].map((schedule) =>
              schedule._id === scheduleId ? updatedSchedule : schedule
            );
          }

          setSchedules((prev) =>
            prev.map((schedule) =>
              schedule._id === scheduleId ? updatedSchedule : schedule
            )
          );

          setScheduleUpdating(false);
          toast.success("Planning mis à jour avec succès!");

          // Appeler le callback onSuccess si fourni
          if (onSuccess && typeof onSuccess === "function") {
            onSuccess(updatedSchedule);
          }

          return { success: true, schedule: updatedSchedule };
        } else {
          console.error("useWeeklySchedules.updateSchedule - Échec", response);

          // Gérer l'erreur d'authentification
          if (response.statusCode === 401) {
            if (!authErrorDetected.current) {
              authErrorDetected.current = true;
              toast.error("Session expirée. Veuillez vous reconnecter.");
              // Rediriger vers la page de connexion après un court délai
              setTimeout(() => {
                navigate("/login?expired=true");
              }, 2000);
            }
          } else {
            setScheduleError(
              response.message || "Erreur lors de la mise à jour du planning"
            );
            toast.error(
              response.message || "Erreur lors de la mise à jour du planning"
            );
          }

          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error("useWeeklySchedules.updateSchedule - Exception", error);
        setScheduleError("Erreur lors de la mise à jour du planning");
        toast.error("Erreur lors de la mise à jour du planning");
        return { success: false, message: "Erreur interne" };
      } finally {
        setScheduleUpdating(false);
      }
    },
    [ensureValidAuth, prepareScheduleForApi, parseScheduleFromApi, navigate]
  );

  /**
   * Récupère les plannings pour une semaine spécifique
   * @param {string} week - Date de début de semaine au format YYYY-MM-DD
   */
  const fetchSchedules = useCallback(async (week) => {
    setSchedulesLoading(true);
    try {
      const response = await WeeklyScheduleService.getByWeek(week);
      setSchedules(response);
      setSchedulesError(null);
    } catch (error) {
      setSchedulesError("Erreur lors du chargement des plannings.");
      console.error(error);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  return {
    schedules,
    schedulesLoading,
    scheduleCreating,
    scheduleUpdating,
    scheduleDeleting,
    schedulesError,
    scheduleError,
    currentWeek,
    fetchSchedulesByWeek,
    fetchSchedules,
    saveSchedule,
    deleteSchedule,
    setWeek,
    createSchedule,
    updateSchedule,
  };
};

export default useWeeklySchedules;
