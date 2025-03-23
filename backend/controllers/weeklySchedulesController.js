/**
 * Contrôleur pour la gestion des plannings hebdomadaires
 */

const db = require("../db");
const moment = require("moment");

/**
 * Récupère tous les plannings d'une semaine spécifiée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getSchedulesByWeek = async (req, res) => {
  try {
    const { weekStart } = req.params;
    const { status } = req.query;

    // Vérifier la validité de la date
    if (!moment(weekStart, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Format de date invalide. Utilisez YYYY-MM-DD",
      });
    }

    // Construire la requête SQL de base
    let query = `
      SELECT ws.*, e.first_name, e.last_name, e.role
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      WHERE ws.week_start = ?
    `;

    const queryParams = [weekStart];

    // Ajouter le filtre de statut si présent
    if (status) {
      query += " AND ws.status = ?";
      queryParams.push(status);
    }

    // Ajouter le tri
    query += " ORDER BY ws.employee_id";

    // Exécuter la requête
    const [schedules] = await db.query(query, queryParams);

    // Traiter les données pour avoir des objets JSON au lieu de chaînes
    const formattedSchedules = schedules.map((schedule) => {
      if (
        schedule.schedule_data &&
        typeof schedule.schedule_data === "string"
      ) {
        try {
          schedule.schedule_data = JSON.parse(schedule.schedule_data);
        } catch (error) {
          console.error("Erreur de parsing JSON pour schedule_data:", error);
        }
      }
      return schedule;
    });

    return res.status(200).json({
      success: true,
      data: formattedSchedules,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des plannings hebdomadaires:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des plannings",
      error: error.message,
    });
  }
};

/**
 * Met à jour un planning hebdomadaire existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_data, total_hours, status } = req.body;

    // Valider les données
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "ID de planning invalide",
      });
    }

    // Valider le statut si présent
    if (status && !["draft", "approved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Utilisez "draft" ou "approved"',
      });
    }

    // Vérifier si le planning existe
    const [scheduleExists] = await db.query(
      "SELECT id FROM weekly_schedules WHERE id = ?",
      [id]
    );

    if (scheduleExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Planning non trouvé",
      });
    }

    // Préparer les champs à mettre à jour
    const updateFields = [];
    const updateValues = [];

    if (schedule_data) {
      // Convertir en chaîne JSON si ce n'est pas déjà le cas
      const scheduleDataString =
        typeof schedule_data === "string"
          ? schedule_data
          : JSON.stringify(schedule_data);

      updateFields.push("schedule_data = ?");
      updateValues.push(scheduleDataString);
    }

    if (total_hours !== undefined) {
      updateFields.push("total_hours = ?");
      updateValues.push(total_hours);
    }

    if (status) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    // Ajouter la date de mise à jour
    updateFields.push("updated_at = NOW()");

    // Vérifier s'il y a des champs à mettre à jour
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun champ à mettre à jour",
      });
    }

    // Construire la requête SQL
    const query = `
      UPDATE weekly_schedules
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    // Ajouter l'ID à la fin des valeurs
    updateValues.push(id);

    // Exécuter la requête
    await db.query(query, updateValues);

    return res.status(200).json({
      success: true,
      message: "Planning mis à jour",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du planning:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur de mise à jour",
      error: error.message,
    });
  }
};
