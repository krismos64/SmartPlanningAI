import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { NotificationService } from "../services/api";

/**
 * Classe utilitaire pour enregistrer les activités des utilisateurs
 */
class ActivityLogger {
  /**
   * Enregistre une activité dans le système
   * @param {Object} activityData - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logActivity(activityData) {
    try {
      // Ajouter l'IP et l'agent utilisateur
      const data = {
        ...activityData,
        ipAddress: await this.getIpAddress(),
        userAgent: navigator.userAgent,
      };

      // Envoyer les données à l'API
      const response = await axios.post(API_ENDPOINTS.ACTIVITIES.LOG, data);

      // Créer une notification pour cette activité
      await this.createNotificationForActivity(activityData);

      console.log("Activité enregistrée avec succès:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      return {
        success: false,
        error: error.message || "Erreur lors de l'enregistrement de l'activité",
      };
    }
  }

  /**
   * Crée une notification pour une activité
   * @param {Object} activityData - Données de l'activité
   * @returns {Promise<void>}
   */
  static async createNotificationForActivity(activityData) {
    try {
      // Déterminer le type de notification en fonction du type d'activité
      let notificationType = "info";
      if (activityData.type === "create") notificationType = "success";
      if (activityData.type === "update") notificationType = "info";
      if (activityData.type === "delete") notificationType = "warning";
      if (activityData.type === "approve" || activityData.type === "reject")
        notificationType = "info";
      if (activityData.type === "error") notificationType = "error";

      // Créer le titre et le message de la notification
      let title = "";
      let message = "";

      switch (activityData.entity_type) {
        case "employee":
          title = `Employé ${this.getActionLabel(activityData.type)}`;
          message = `Un employé a été ${this.getActionDescription(
            activityData.type
          )}.`;
          break;
        case "vacation":
          title = `Congé ${this.getActionLabel(activityData.type)}`;
          message = `Une demande de congé a été ${this.getActionDescription(
            activityData.type
          )}.`;
          break;
        case "schedule":
          title = `Planning ${this.getActionLabel(activityData.type)}`;
          message = `Un planning a été ${this.getActionDescription(
            activityData.type
          )}.`;
          break;
        case "work_hours":
          title = `Heures de travail ${this.getActionLabel(activityData.type)}`;
          message = `Des heures de travail ont été ${this.getActionDescription(
            activityData.type
          )}.`;
          break;
        case "hour_balance":
          title = `Solde d'heures ${this.getActionLabel(activityData.type)}`;
          message = `Un solde d'heures a été ${this.getActionDescription(
            activityData.type
          )}.`;
          break;
        default:
          title = `Activité ${this.getActionLabel(activityData.type)}`;
          message = `Une activité a été ${this.getActionDescription(
            activityData.type
          )}.`;
      }

      // Ajouter la description si disponible
      if (activityData.description) {
        message = activityData.description;
      }

      // Créer la notification
      const notificationData = {
        user_id: activityData.userId,
        title,
        message,
        type: notificationType,
        entity_type: activityData.entity_type,
        entity_id: activityData.entity_id,
        link: this.getLinkForEntity(
          activityData.entity_type,
          activityData.entity_id
        ),
      };

      // Envoyer la notification
      await NotificationService.createNotification(notificationData);
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
    }
  }

  /**
   * Obtient le libellé de l'action
   * @param {string} actionType - Type d'action
   * @returns {string} - Libellé de l'action
   */
  static getActionLabel(actionType) {
    switch (actionType) {
      case "create":
        return "créé";
      case "update":
        return "modifié";
      case "delete":
        return "supprimé";
      case "approve":
        return "approuvé";
      case "reject":
        return "rejeté";
      case "login":
        return "connexion";
      case "logout":
        return "déconnexion";
      default:
        return actionType;
    }
  }

  /**
   * Obtient la description de l'action
   * @param {string} actionType - Type d'action
   * @returns {string} - Description de l'action
   */
  static getActionDescription(actionType) {
    switch (actionType) {
      case "create":
        return "créé";
      case "update":
        return "modifié";
      case "delete":
        return "supprimé";
      case "approve":
        return "approuvé";
      case "reject":
        return "rejeté";
      case "login":
        return "connecté";
      case "logout":
        return "déconnecté";
      default:
        return actionType;
    }
  }

  /**
   * Obtient le lien pour une entité
   * @param {string} entityType - Type d'entité
   * @param {string|number} entityId - ID de l'entité
   * @returns {string} - Lien vers l'entité
   */
  static getLinkForEntity(entityType, entityId) {
    switch (entityType) {
      case "employee":
        return `/employees/${entityId}`;
      case "vacation":
        return `/vacations/${entityId}`;
      case "schedule":
        return `/weekly-schedule/${entityId}`;
      case "work_hours":
        return `/work-hours/${entityId}`;
      case "hour_balance":
        return `/hour-balance/${entityId}`;
      default:
        return "/";
    }
  }

  /**
   * Obtient l'adresse IP de l'utilisateur
   * @returns {Promise<string>} - Adresse IP
   */
  static async getIpAddress() {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
      return "unknown";
    }
  }

  /**
   * Enregistre une activité de création
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logCreation(data) {
    return this.logActivity({
      ...data,
      type: "create",
    });
  }

  /**
   * Enregistre une activité de mise à jour
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logUpdate(data) {
    return this.logActivity({
      ...data,
      type: "update",
    });
  }

  /**
   * Enregistre une activité de suppression
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logDeletion(data) {
    return this.logActivity({
      ...data,
      type: "delete",
    });
  }

  /**
   * Enregistre une activité d'approbation
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logApproval(data) {
    return this.logActivity({
      ...data,
      type: "approve",
    });
  }

  /**
   * Enregistre une activité de rejet
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logRejection(data) {
    return this.logActivity({
      ...data,
      type: "reject",
    });
  }

  /**
   * Enregistre une activité de connexion
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logLogin(data) {
    return this.logActivity({
      ...data,
      type: "login",
    });
  }

  /**
   * Enregistre une activité de déconnexion
   * @param {Object} data - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logLogout(data) {
    return this.logActivity({
      ...data,
      type: "logout",
    });
  }
}

export default ActivityLogger;
