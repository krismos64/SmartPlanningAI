import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { HourBalanceService } from "../services/api";

/**
 * Hook personnalisé pour gérer le solde d'heures des employés
 */
const useHourBalance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère le solde d'heures d'un employé
   * @param {number} employeeId - ID de l'employé
   * @returns {Promise<Object>} - Solde d'heures de l'employé
   */
  const getEmployeeBalance = useCallback(async (employeeId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await HourBalanceService.getByEmployee(employeeId);

      if (!result.success) {
        console.warn(
          `Avertissement: Impossible de récupérer le solde d'heures pour l'employé ${employeeId}:`,
          result.message
        );
        return 0; // Retourner 0 par défaut au lieu de lancer une erreur
      }

      return result.balance;
    } catch (err) {
      console.warn(
        `Avertissement: Erreur lors de la récupération du solde d'heures pour l'employé ${employeeId}:`,
        err
      );
      setError(
        err.message || "Erreur lors de la récupération du solde d'heures"
      );
      // Ne pas afficher de toast d'erreur pour ne pas perturber l'utilisateur
      return 0; // Retourner 0 par défaut
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour le solde d'heures d'un employé
   * @param {number} employeeId - ID de l'employé
   * @param {Object} balanceData - Données du solde d'heures
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  const updateEmployeeBalance = useCallback(async (employeeId, balanceData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await HourBalanceService.updateBalance(
        employeeId,
        balanceData
      );

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors de la mise à jour du solde d'heures"
        );
      }

      toast.success("Solde d'heures mis à jour avec succès");
      return { success: true, balance: result.balance };
    } catch (err) {
      console.error(
        `Erreur lors de la mise à jour du solde d'heures pour l'employé ${employeeId}:`,
        err
      );
      setError(
        err.message || "Erreur lors de la mise à jour du solde d'heures"
      );
      toast.error("Erreur lors de la mise à jour du solde d'heures");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getEmployeeBalance,
    updateEmployeeBalance,
  };
};

export default useHourBalance;
