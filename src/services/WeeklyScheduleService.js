import { toast } from "react-hot-toast";
import { API_ENDPOINTS, apiRequest } from "../config/api";

class WeeklyScheduleService {
  static async getSchedules(startDate) {
    try {
      console.log("Récupération des plannings pour la date:", startDate);

      // Utiliser apiRequest au lieu d'axios.get
      const response = await apiRequest(
        API_ENDPOINTS.WEEKLY_SCHEDULES,
        "GET",
        null,
        { start_date: startDate }
      );

      console.log("Plannings récupérés:", response);
      return response;
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  }

  static async getScheduleById(id) {
    try {
      console.log(`Récupération du planning ${id}`);

      // Utiliser apiRequest au lieu d'axios.get
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "GET"
      );

      console.log(`Planning ${id} récupéré:`, response);
      return response;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  }

  static async createSchedule(scheduleData) {
    try {
      // Détecter si c'est une mise à jour ou une création
      const isExisting = Boolean(scheduleData.id);
      const id = scheduleData.id;

      console.log(
        "📝 Enregistrement planning (mode:",
        isExisting ? "PUT" : "POST",
        ")"
      );

      // Si c'est une mise à jour, extraire l'ID et appeler updateSchedule
      if (isExisting) {
        // Supprimer l'ID du corps de la requête pour éviter les doublons
        const { id: scheduleId, ...dataWithoutId } = scheduleData;
        return await this.updateSchedule(scheduleId, dataWithoutId);
      }

      // Sinon, procéder à la création
      console.log(
        "Création d'un nouveau planning avec les données:",
        scheduleData
      );

      // Utiliser apiRequest au lieu d'axios.post
      const response = await apiRequest(
        API_ENDPOINTS.WEEKLY_SCHEDULES,
        "POST",
        scheduleData
      );

      console.log("Réponse du serveur pour la création:", response);

      // Notification de succès
      toast.success("Planning créé avec succès");

      return response;
    } catch (error) {
      console.error("Error creating/updating schedule:", error);

      // Notification d'erreur avec détails
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'enregistrement du planning";
      toast.error(errorMessage);

      throw error;
    }
  }

  static async updateSchedule(id, scheduleData) {
    try {
      console.log(
        `Mise à jour du planning ${id} avec les données:`,
        scheduleData
      );

      // Utiliser apiRequest au lieu d'axios.put
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "PUT",
        scheduleData
      );

      console.log(
        `Réponse du serveur pour la mise à jour du planning ${id}:`,
        response
      );

      // Notification de succès pour la mise à jour
      toast.success("Planning mis à jour avec succès");

      return response;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);

      // Notification d'erreur avec détails
      const errorMessage =
        error.response?.data?.message ||
        `Erreur lors de la mise à jour du planning ${id}`;
      toast.error(errorMessage);

      throw error;
    }
  }

  static async deleteSchedule(id) {
    try {
      // Utiliser apiRequest au lieu d'axios.delete
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "DELETE"
      );

      // Notification de succès pour la suppression
      toast.success("Planning supprimé avec succès");

      return response;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);

      // Notification d'erreur
      toast.error("Erreur lors de la suppression du planning");

      throw error;
    }
  }

  static async generateSchedule(generateOptions) {
    try {
      // Utiliser apiRequest au lieu d'axios.post
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/generate`,
        "POST",
        generateOptions
      );

      return response.data || response;
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }
}

export default WeeklyScheduleService;
