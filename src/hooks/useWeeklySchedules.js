import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { formatDateForAPI } from "../utils/dateUtils";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 */
const useWeeklySchedules = (weekStart) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // Référence pour suivre si une requête est déjà en cours
  const isFetchingRef = useRef(false);
  // Cache pour stocker les données par semaine
  const cacheRef = useRef({});

  // Formater la date de début de semaine pour l'API
  const formattedWeekStart = formatDateForAPI(weekStart);

  // Clé de cache basée sur la date de début de semaine
  const cacheKey = formattedWeekStart;

  // Charger les plannings pour la semaine spécifiée
  const fetchSchedules = useCallback(
    async (forceRefresh = false) => {
      // Si une requête est déjà en cours, ne pas en lancer une autre
      if (isFetchingRef.current) {
        console.log("Requête déjà en cours, ignorée");
        return;
      }

      // Vérifier si les données sont déjà en cache et non forcées à rafraîchir
      if (!forceRefresh && cacheRef.current[cacheKey]) {
        console.log("Utilisation des données en cache pour", cacheKey);
        setScheduleData(cacheRef.current[cacheKey]);
        setLoading(false);
        return;
      }

      // Marquer qu'une requête est en cours
      isFetchingRef.current = true;
      setLoading(true);

      try {
        console.log("Chargement des plannings pour", cacheKey);

        // Utiliser le nouvel endpoint API qui filtre correctement par semaine
        const response = await api.get(
          `/api/weekly-schedules/week/${formattedWeekStart}`
        );

        // Vérifier si response.data existe et est un tableau
        if (response && response.data && Array.isArray(response.data)) {
          // Transformer les données au nouveau format
          const transformedData = response.data.map((schedule) => {
            // S'assurer que schedule_data est un tableau
            let scheduleData;
            if (typeof schedule.schedule_data === "string") {
              try {
                scheduleData = JSON.parse(schedule.schedule_data);
              } catch (e) {
                console.error(
                  "Erreur lors du parsing des données du planning:",
                  e
                );
                scheduleData = [];
              }
            } else {
              scheduleData = schedule.schedule_data || [];
            }

            return {
              id: schedule.id,
              employeeId: schedule.employee_id,
              weekStart: schedule.week_start,
              days: scheduleData,
              totalHours: schedule.total_hours,
            };
          });

          // Mettre à jour le cache et l'état
          cacheRef.current[cacheKey] = transformedData;
          setScheduleData(transformedData);
          console.log("Données transformées:", transformedData);
        } else {
          // Si les données ne sont pas au format attendu, définir un tableau vide
          console.warn("Format de données inattendu:", response);
          cacheRef.current[cacheKey] = [];
          setScheduleData([]);
        }

        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des plannings:", err);
        setError("Impossible de charger les plannings");
        toast.error("Erreur lors du chargement des plannings");

        // En cas d'erreur, définir un tableau vide pour éviter les erreurs d'affichage
        setScheduleData([]);
      } finally {
        setLoading(false);
        // Marquer que la requête est terminée
        isFetchingRef.current = false;
      }
    },
    [api, formattedWeekStart, cacheKey]
  );

  // Sauvegarder un planning pour un employé spécifique
  const saveEmployeeSchedule = useCallback(
    async (scheduleData) => {
      try {
        console.log("Sauvegarde du planning:", scheduleData);

        // Calculer le total des heures
        const totalHours = scheduleData.days.reduce(
          (sum, day) => sum + (parseFloat(day.hours) || 0),
          0
        );

        // Transformer les données au format attendu par l'API
        const apiData = {
          employee_id: scheduleData.employeeId,
          week_start: formattedWeekStart,
          schedule_data: scheduleData.days,
          total_hours: totalHours.toFixed(2),
          status: "active",
        };

        let response;
        if (scheduleData.id) {
          console.log("Mise à jour du planning existant ID:", scheduleData.id);
          // Mettre à jour le planning existant
          response = await api.put(
            `/api/weekly-schedules/${scheduleData.id}`,
            apiData
          );
        } else {
          console.log("Création d'un nouveau planning");
          // Créer un nouveau planning
          response = await api.post("/api/weekly-schedules", apiData);
        }

        // Forcer le rafraîchissement du cache après une sauvegarde
        await fetchSchedules(true);
        return response.data;
      } catch (err) {
        console.error("Erreur lors de la sauvegarde du planning:", err);
        toast.error("Erreur lors de la sauvegarde du planning");
        throw err;
      }
    },
    [api, fetchSchedules, formattedWeekStart]
  );

  // Sauvegarder plusieurs plannings à la fois
  const saveSchedules = useCallback(
    async (schedulesData) => {
      try {
        // Pour l'instant, sauvegarder les plannings un par un
        // car l'API ne supporte pas les opérations par lot
        for (const schedule of schedulesData) {
          await saveEmployeeSchedule(schedule);
        }

        return { success: true };
      } catch (err) {
        console.error("Erreur lors de la sauvegarde des plannings:", err);
        toast.error("Erreur lors de la sauvegarde des plannings");
        throw err;
      }
    },
    [saveEmployeeSchedule]
  );

  // Charger les plannings au chargement du composant ou lorsque la semaine change
  useEffect(() => {
    // Invalider le cache si la semaine change
    fetchSchedules(false);

    // Nettoyage : annuler les requêtes en cours si le composant est démonté
    return () => {
      isFetchingRef.current = false;
    };
  }, [fetchSchedules]);

  return {
    scheduleData,
    loading,
    error,
    fetchSchedules,
    saveEmployeeSchedule,
    saveSchedules,
  };
};

export default useWeeklySchedules;
