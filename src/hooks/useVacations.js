import { useCallback, useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { useApi } from "../contexts/ApiContext";
import { useAuth } from "../contexts/AuthContext";
import { VacationService } from "../services/api";
import { formatError } from "../utils/errorHandling";
import { notifyError } from "../utils/notificationUtils";

/**
 * Hook personnalisé pour gérer les congés
 * Version optimisée sans WebSocket pour simplifier le chargement des données
 * Ce hook effectue un simple appel REST à l'API pour récupérer les données
 * sans nécessiter de mises à jour en temps réel ou de mécanismes complexes de mise en cache
 */
const useVacations = () => {
  const { api } = useApi();
  const { user } = useAuth();
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isComponentMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Marquer le composant comme monté/démonté
  useEffect(() => {
    // Réinitialiser l'état au montage
    isComponentMountedRef.current = true;
    isFetchingRef.current = false;

    return () => {
      // Marquer comme démonté pour éviter les mises à jour d'état après démontage
      isComponentMountedRef.current = false;

      // Réinitialiser les références au démontage
      isFetchingRef.current = false;
    };
  }, []);

  // Fonction simplifiée pour charger les congés depuis l'API
  const fetchVacations = useCallback(async () => {
    // Éviter les appels API multiples simultanés
    if (isFetchingRef.current || !isComponentMountedRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (!token) {
        setError("Vous devez être connecté pour accéder à ces données");
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      let user = null;
      try {
        user = JSON.parse(userString);
        console.log("Utilisateur courant:", user);
      } catch (e) {
        console.error("Erreur lors du parsing de l'utilisateur:", e);
        setError("Erreur d'identification de l'utilisateur");
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      console.log(
        "Récupération des congés avec le token:",
        token.substring(0, 15) + "..."
      );

      // Utiliser le service dédié aux vacations
      console.log("Appel de VacationService.getAll()");
      const result = await VacationService.getAll();
      console.log("Résultat de VacationService.getAll():", result);

      // Si le résultat est une erreur mais avec message spécifique de tableau vide, considérer comme un succès
      if (!result || !result.success) {
        if (
          result &&
          result.message &&
          (result.message.includes("aucune demande") ||
            result.message.includes("empty") ||
            result.message.includes("vide"))
        ) {
          // C'est un cas normal pour un nouvel utilisateur: aucune vacation trouvée
          console.log(
            "Aucune demande de congé trouvée - cas normal pour un nouvel utilisateur"
          );
          if (isComponentMountedRef.current) {
            setVacations([]);
            setError(null);
          }
          return;
        } else {
          throw new Error(
            result?.message || "Aucune réponse reçue du service de congés"
          );
        }
      }

      // Extraire les données, quelle que soit la structure de la réponse
      let vacationsData = [];

      if (Array.isArray(result)) {
        // Cas 1: La réponse est directement un tableau de congés
        console.log("Format de réponse: tableau direct");
        vacationsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        // Cas 2: La réponse est un objet avec une propriété data qui est un tableau
        console.log("Format de réponse: objet avec data Array");
        vacationsData = result.data;
      } else if (
        (result.success && result.data === null) ||
        result.data === undefined
      ) {
        // Cas où result.data est null ou undefined - considérer comme un tableau vide
        console.log(
          "Format de réponse: données nulles ou non définies, utilisation d'un tableau vide"
        );
        vacationsData = [];
      } else if (result.success && Array.isArray(result.data)) {
        // Cas 3: Format standardisé { success, data, message }
        console.log("Format de réponse: standardisé avec data Array");
        vacationsData = result.data;
      } else if (typeof result === "object") {
        // Cas 4: Autre structure d'objet, tentons d'extraire les données
        console.log("Format de réponse: objet inconnu, tentative d'extraction");

        // Chercher une propriété qui pourrait contenir un tableau de vacations
        const potentialArrayProps = Object.keys(result).filter((key) =>
          Array.isArray(result[key])
        );

        if (potentialArrayProps.length > 0) {
          console.log(
            "Propriétés contenant des tableaux:",
            potentialArrayProps
          );
          // Utiliser la première propriété qui contient un tableau
          vacationsData = result[potentialArrayProps[0]];
        } else {
          // Dernier recours: si l'objet lui-même ressemble à une vacation unique
          if (result.id) {
            console.log("Format de réponse: objet unique de vacation");
            vacationsData = [result];
          } else {
            // Si aucun format reconnu, utiliser un tableau vide au lieu de lever une erreur
            console.log(
              "Format non reconnu mais on continue avec un tableau vide"
            );
            vacationsData = [];
          }
        }
      } else {
        // Cas non géré, utiliser un tableau vide au lieu de lever une erreur
        console.log(
          `Format de réponse inattendu: ${typeof result}, utilisation d'un tableau vide`
        );
        vacationsData = [];
      }

      // Log des données extraites
      console.log(`Vacations extraites: ${vacationsData.length} éléments`);
      if (vacationsData.length > 0) {
        console.log(
          "Exemple de vacation:",
          JSON.stringify(vacationsData[0], null, 2)
        );
      }

      // Vérifier et corriger les noms d'employés dans les données
      vacationsData = vacationsData.map((vacation) => {
        // Log détaillé des données d'employé avant traitement
        console.log("Données brutes d'employé:", {
          id: vacation.id,
          employee_id: vacation.employee_id,
          employee_name: vacation.employee_name,
          employee_first_name:
            vacation.employee_first_name ||
            (vacation.employee && vacation.employee.first_name),
          employee_last_name:
            vacation.employee_last_name ||
            (vacation.employee && vacation.employee.last_name),
          employee_obj: vacation.employee
            ? Object.keys(vacation.employee)
            : "absent",
        });

        // S'assurer que employee_name est défini
        if (!vacation.employee_name) {
          if (
            vacation.employee &&
            vacation.employee.first_name &&
            vacation.employee.last_name
          ) {
            vacation.employee_name =
              `${vacation.employee.first_name} ${vacation.employee.last_name}`.trim();
            console.log(
              `ID ${vacation.id}: Nom construit depuis employee.first_name et employee.last_name: ${vacation.employee_name}`
            );
          } else if (
            vacation.employee_first_name &&
            vacation.employee_last_name
          ) {
            vacation.employee_name =
              `${vacation.employee_first_name} ${vacation.employee_last_name}`.trim();
            console.log(
              `ID ${vacation.id}: Nom construit depuis employee_first_name et employee_last_name: ${vacation.employee_name}`
            );
          } else {
            // Récupération du nom depuis les champs plats de la réponse API
            if (vacation.first_name && vacation.last_name) {
              vacation.employee_name =
                `${vacation.first_name} ${vacation.last_name}`.trim();
              console.log(
                `ID ${vacation.id}: Nom construit depuis first_name et last_name: ${vacation.employee_name}`
              );
            } else {
              vacation.employee_name = `Employé #${vacation.employee_id}`;
              console.log(
                `ID ${vacation.id}: Aucun nom trouvé, utilisation de l'ID: ${vacation.employee_name}`
              );
            }
          }
        } else {
          console.log(
            `ID ${vacation.id}: Nom d'employé déjà défini: ${vacation.employee_name}`
          );
        }

        // Vérifier si le nom est vide ou contient seulement des espaces
        if (!vacation.employee_name || vacation.employee_name.trim() === "") {
          vacation.employee_name = `Employé #${vacation.employee_id}`;
          console.log(
            `ID ${vacation.id}: Nom vide ou espaces détectés, utilisation de l'ID: ${vacation.employee_name}`
          );
        }

        // Log pour débogage
        console.log(
          `Vacation ID ${vacation.id}: employee_name final = ${vacation.employee_name}`
        );

        return vacation;
      });

      if (isComponentMountedRef.current) {
        // IMPORTANT: Désactiver temporairement le filtrage pour afficher toutes les demandes
        // Cela permettra de voir toutes les demandes, y compris les nouvelles
        setVacations(vacationsData);
        setError(null);
        console.log(
          "Toutes les demandes de congés sont affichées:",
          vacationsData.length
        );
      }

      return { success: true, data: vacationsData };
    } catch (err) {
      const errorMessage = formatError(err);
      console.error("Erreur lors du chargement des congés:", errorMessage);
      notifyError(errorMessage, setError);
      return { success: false, error: errorMessage };
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [user]);

  // Rafraîchissement des données
  const refreshVacations = useCallback(
    () => fetchVacations(),
    [fetchVacations]
  );

  // Chargement initial des données
  useEffect(() => {
    if (isComponentMountedRef.current) {
      fetchVacations();
    }

    // Nettoyer lors du démontage
    return () => {
      // On ne fait rien ici car le nettoyage est géré dans le premier useEffect
    };
  }, [fetchVacations]);

  // Créer une nouvelle demande de congé
  const createVacation = useCallback(
    async (vacationData) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);

        // Formater les données pour l'API en transformant les noms de propriétés camelCase en snake_case
        let formattedData = {
          employee_id: vacationData.employeeId,
          start_date: vacationData.startDate,
          end_date: vacationData.endDate,
          type: vacationData.type,
          reason: vacationData.reason || "",
          status: vacationData.status || "pending",
          duration: vacationData.duration || null,
        };

        console.log("Données formatées pour l'API:", formattedData);

        // Utiliser VacationService.create au lieu de api.post
        const result = await VacationService.create(formattedData);

        console.log("Réponse création congé:", result);

        // Si la création a réussi, mettre à jour l'état local
        if (result && result.success) {
          // Si on a bien une nouvelle vacation, on l'ajoute à la liste
          if (result.data) {
            setVacations((prev) => [...prev, result.data]);
          } else if (result.id) {
            // Pour la compatibilité avec l'ancien format où l'ID est directement dans result
            const newVacation = {
              ...formattedData,
              id: result.id,
            };
            setVacations((prev) => [...prev, newVacation]);
          }

          // Suppression de la notification ici - elle sera gérée par le composant appelant

          // Uniquement si le composant est toujours monté
          if (isComponentMountedRef.current) {
            await fetchVacations(); // Rafraîchir les données pour s'assurer de la cohérence
          }
        } else {
          // Suppression de la notification d'erreur ici - elle sera gérée par le composant appelant
        }

        return result;
      } catch (error) {
        const errorMessage = formatError(error);

        if (isComponentMountedRef.current) {
          // Ne pas afficher de notification d'erreur ici, laisser le composant le faire
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchVacations]
  );

  // Mettre à jour une demande de congé
  const updateVacation = useCallback(
    async (id, vacationData) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);

        // S'assurer que la durée est calculée si elle n'est pas déjà définie
        let formattedData = { ...vacationData };

        // Si la durée n'est pas définie mais les dates de début et fin sont présentes,
        // calculer la durée en jours ouvrés
        if (
          !formattedData.duration &&
          formattedData.startDate &&
          formattedData.endDate
        ) {
          const start = new Date(formattedData.startDate);
          const end = new Date(formattedData.endDate);

          // Importer la fonction depuis les utils si nécessaire
          const { getWorkingDaysCount } = require("../utils/dateUtils");
          formattedData.duration = getWorkingDaysCount(start, end);
        }

        // Utiliser VacationService.update au lieu de api.put
        const response = await VacationService.update(id, formattedData);

        // Adaptation à la nouvelle structure de réponse API
        const updatedVacation = response.data || response;

        if (isComponentMountedRef.current) {
          setVacations((prev) =>
            prev.map((vacation) =>
              vacation.id === id
                ? { ...vacation, ...updatedVacation }
                : vacation
            )
          );
          // Suppression de la notification ici - elle sera gérée par le composant appelant
        }

        return {
          success: response.success !== undefined ? response.success : true,
          data: updatedVacation,
          message:
            response.message || "Demande de congé mise à jour avec succès",
        };
      } catch (error) {
        const errorMessage = formatError(error);

        if (isComponentMountedRef.current) {
          // Ne pas afficher de notification d'erreur ici, laisser le composant le faire
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [isComponentMountedRef]
  );

  // Supprimer une demande de congé
  const deleteVacation = useCallback(
    async (id) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);
        // Utiliser VacationService.delete au lieu de api.delete
        const response = await VacationService.delete(id);

        if (isComponentMountedRef.current) {
          // Mettre à jour l'état local sans afficher de notification
          setVacations((prev) => prev.filter((vacation) => vacation.id !== id));
          // Suppression de la notification ici - elle sera gérée par le composant appelant
        }

        return {
          success: response.success !== undefined ? response.success : true,
          message: response.message || "Demande de congé supprimée avec succès",
        };
      } catch (error) {
        const errorMessage = formatError(error);

        if (isComponentMountedRef.current) {
          // Ne pas afficher de notification d'erreur ici, laisser le composant le faire
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [isComponentMountedRef]
  );

  /**
   * Met à jour le statut d'une demande de congés (approve/reject/pending)
   * @param {number} id - L'ID de la demande de congés
   * @param {string} action - L'action à effectuer ('approved', 'rejected', 'pending') ou le statut directement
   * @param {string} comment - Le commentaire en cas de rejet
   * @returns {Promise<Object>} - Le résultat de l'opération
   */
  const updateVacationStatus = useCallback(
    async (id, action, comment = "") => {
      if (!isComponentMountedRef.current) return { success: false };

      // Vérifier que l'ID est bien défini
      if (!id) {
        console.error("ID manquant pour la mise à jour du statut");
        return {
          success: false,
          error: "ID manquant pour la mise à jour du statut",
        };
      }

      try {
        setLoading(true);

        // Déterminer le statut en fonction de l'action
        let status;
        if (
          action === "approved" ||
          action === "rejected" ||
          action === "pending"
        ) {
          // Si action est déjà un statut valide, l'utiliser directement
          status = action;
        } else {
          // Sinon, interpréter l'action comme avant
          status = action === "rejected" ? "rejected" : "approved";
        }

        // Construire l'URL de l'endpoint et préparer les données
        const url = `${API_ENDPOINTS.VACATIONS.UPDATE_STATUS(id)}`;
        const data = { status, comment };

        // Déplacer la fonction getUserId à l'intérieur du callback
        const getUserId = () => (user ? user.id : null);

        console.log(`Mise à jour du statut de la demande ${id} à ${status}`);

        // Utiliser la nouvelle structure où le comment est inclus dans la raison
        // L'API attend maintenant un objet avec status et comment, mais fusionnera le comment dans reason
        const result = await VacationService.updateStatus(id, status, comment);

        if (result && result.success) {
          // Si la mise à jour a réussi, mettre à jour l'état local
          setVacations((prev) =>
            prev.map((vacation) => {
              if (vacation.id === id) {
                // Construire un objet mis à jour avec le nouveau statut
                const updatedVacation = { ...vacation, status };

                // En fonction du statut, mettre à jour les informations appropriées
                if (status === "approved") {
                  updatedVacation.approved_by = getUserId();
                  updatedVacation.approved_at = new Date().toISOString();
                  updatedVacation.rejected_by = null;
                  updatedVacation.rejected_at = null;
                } else if (status === "rejected") {
                  updatedVacation.rejected_by = getUserId();
                  updatedVacation.rejected_at = new Date().toISOString();
                  updatedVacation.approved_by = null;
                  updatedVacation.approved_at = null;

                  // Si un commentaire est fourni, l'ajouter à la raison existante
                  if (comment) {
                    updatedVacation.reason = vacation.reason
                      ? `${vacation.reason} | Motif de rejet: ${comment}`
                      : `Motif de rejet: ${comment}`;
                  }
                }

                return updatedVacation;
              }
              return vacation;
            })
          );

          // Suppression de la notification ici - elle sera gérée par le composant appelant
        } else {
          // Suppression de la notification d'erreur ici - elle sera gérée par le composant appelant
        }

        return result;
      } catch (error) {
        const errorMessage = formatError(error);

        if (isComponentMountedRef.current) {
          // Ne pas afficher de notification d'erreur ici, laisser le composant le faire
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [user]
  );

  // Filtrer les congés par statut
  const getVacationsByStatus = useCallback(
    (status) => vacations.filter((vacation) => vacation.status === status),
    [vacations]
  );

  return {
    vacations,
    loading,
    error,
    createVacation,
    updateVacation,
    deleteVacation,
    updateVacationStatus,
    getVacationsByStatus,
    refreshVacations,
    setVacations,
  };
};

export default useVacations;
