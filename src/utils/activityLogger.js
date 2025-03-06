import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

/**
 * Utilitaire pour enregistrer les activités dans la base de données
 */
class ActivityLogger {
  /**
   * Enregistre une activité dans la base de données
   * @param {string} type - Type d'activité (create, update, delete, approve, reject, login, logout)
   * @param {string} entity_type - Type d'entité concernée (employee, schedule, vacation, user, etc.)
   * @param {string} entity_id - ID de l'entité concernée
   * @param {string} description - Description de l'activité
   * @param {object} userData - Données de l'utilisateur qui a effectué l'action
   * @param {object} details - Détails supplémentaires au format JSON
   * @returns {Promise<object>} - Promesse avec les données de l'activité créée
   */
  static async logActivity(
    type,
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    try {
      const activityData = {
        type,
        entity_type,
        entity_id,
        description,
        userId: userData?.id || null,
        userName:
          userData?.first_name && userData?.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData?.username || "Utilisateur inconnu",
        details,
        timestamp: new Date().toISOString(),
      };

      console.log("Enregistrement d'une nouvelle activité:", activityData);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        API_ENDPOINTS.ACTIVITIES.LOG,
        activityData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Activité enregistrée avec succès:", response.data);
        return response.data;
      } else {
        console.error(
          "Erreur lors de l'enregistrement de l'activité:",
          response.data?.message
        );
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      return null;
    }
  }

  /**
   * Enregistre une activité de création
   */
  static async logCreation(
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    return this.logActivity(
      "create",
      entity_type,
      entity_id,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité de mise à jour
   */
  static async logUpdate(
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    return this.logActivity(
      "update",
      entity_type,
      entity_id,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité de suppression
   */
  static async logDeletion(
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    return this.logActivity(
      "delete",
      entity_type,
      entity_id,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité d'approbation
   */
  static async logApproval(
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    return this.logActivity(
      "approve",
      entity_type,
      entity_id,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité de rejet
   */
  static async logRejection(
    entity_type,
    entity_id,
    description,
    userData,
    details = {}
  ) {
    return this.logActivity(
      "reject",
      entity_type,
      entity_id,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité de connexion
   */
  static async logLogin(userId, description, userData, details = {}) {
    return this.logActivity(
      "login",
      "user",
      userId,
      description,
      userData,
      details
    );
  }

  /**
   * Enregistre une activité de déconnexion
   */
  static async logLogout(userId, description, userData, details = {}) {
    return this.logActivity(
      "logout",
      "user",
      userId,
      description,
      userData,
      details
    );
  }
}

export default ActivityLogger;
