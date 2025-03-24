/**
 * Contrôleur pour la gestion des plannings hebdomadaires
 */

const db = require("../db");
const moment = require("moment");
const WeeklySchedule = require("../models/WeeklySchedule");

/**
 * Crée un nouveau planning hebdomadaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createSchedule = async (req, res) => {
  try {
    const { employee_id, week_start, schedule_data, total_hours, status } =
      req.body;

    // Valider les données obligatoires
    if (!employee_id || !week_start) {
      return res.status(400).json({
        success: false,
        message: "ID employé et date de début de semaine requis",
      });
    }

    // Log des données reçues
    console.log("🧪 Planning reçu (backend):", {
      employee_id,
      week_start,
      total_hours,
      schedule_data,
    });

    // Convertir schedule_data en JSON stringifié si ce n'est pas déjà le cas
    const scheduleDataString =
      typeof schedule_data === "string"
        ? schedule_data
        : JSON.stringify(schedule_data);

    // Créer l'objet de planning
    const scheduleObj = new WeeklySchedule({
      employee_id,
      week_start,
      schedule_data: scheduleDataString,
      total_hours: total_hours || 0,
      status: status || "draft",
      created_by: req.user ? req.user.id : null,
    });

    // Sauvegarder le planning
    const result = await scheduleObj.save();

    // Si l'opération a échoué, renvoyer l'erreur
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Récupérer l'ID du planning (qu'il soit nouvellement créé ou mis à jour)
    const scheduleId = result.id;

    // Récupérer les informations de l'employé
    const [employeeResult] = await db.query(
      "SELECT first_name, last_name FROM employees WHERE id = ?",
      [employee_id]
    );

    // Enregistrer l'activité
    if (req.user && req.user.id) {
      try {
        const Activity = require("../models/Activity");
        const Notification = require("../models/Notification");

        // Détails de l'employé pour le message
        const employeeName =
          employeeResult.length > 0
            ? `${employeeResult[0].first_name} ${employeeResult[0].last_name}`
            : `Employé #${employee_id}`;

        // Type d'activité (création ou mise à jour)
        const activityType = result.isUpdate ? "update" : "create";

        // Description de l'activité
        const description = result.isUpdate
          ? `Mise à jour d'un planning pour ${employeeName} (semaine du ${week_start})`
          : `Création d'un planning pour ${employeeName} (semaine du ${week_start})`;

        // Log de l'activité
        await Activity.logActivity({
          type: activityType,
          entity_type: "schedule",
          entity_id: scheduleId,
          description,
          user_id: req.user.id,
        });

        // Créer une notification pour les administrateurs et managers
        const [managers] = await db.query(
          "SELECT id FROM users WHERE role IN ('admin', 'manager')"
        );

        // Titre de la notification
        const notificationTitle = result.isUpdate
          ? "Planning modifié"
          : "Nouveau planning créé";

        // Message de la notification
        const notificationMessage = result.isUpdate
          ? `Le planning de ${employeeName} (semaine du ${week_start}) a été modifié`
          : `Un planning a été créé pour ${employeeName} (semaine du ${week_start})`;

        // Notifier chaque manager/admin
        for (const manager of managers) {
          // Ne pas notifier l'utilisateur qui a fait la modification
          if (manager.id !== req.user.id) {
            await Notification.createAndBroadcast({
              user_id: manager.id,
              title: notificationTitle,
              message: notificationMessage,
              type: "info",
              entity_type: "schedule",
              entity_id: scheduleId,
              link: `/weekly-schedule/${week_start}`,
            });
          }
        }
      } catch (activityError) {
        console.error(
          "Erreur lors de l'enregistrement de l'activité ou de la notification:",
          activityError
        );
      }
    }

    // Déterminer le code de statut (201 pour création, 200 pour mise à jour)
    const statusCode = result.isUpdate ? 200 : 201;

    return res.status(statusCode).json({
      success: true,
      message: result.message || "Opération sur le planning réussie",
      schedule: result.schedule,
    });
  } catch (error) {
    console.error("Erreur lors de la création du planning:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du planning",
      error: error.message,
    });
  }
};

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
    const { employee_id, week_start, schedule_data, total_hours, status } =
      req.body;

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
      "SELECT id, employee_id, week_start FROM weekly_schedules WHERE id = ?",
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

    // Ajouter l'employé si fourni
    if (employee_id) {
      updateFields.push("employee_id = ?");
      updateValues.push(employee_id);
    }

    // Ajouter la date de début si fournie
    if (week_start) {
      updateFields.push("week_start = ?");
      updateValues.push(week_start);
    }

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

    // Ajout du champ updated_by s'il y a un utilisateur connecté
    if (req.user && req.user.id) {
      updateFields.push("updated_by = ?");
      updateValues.push(req.user.id);
    }

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

    // Récupérer le planning mis à jour pour le renvoyer dans la réponse
    const [updatedSchedule] = await db.query(
      "SELECT * FROM weekly_schedules WHERE id = ?",
      [id]
    );

    // Formater le schedule_data si c'est une chaîne JSON
    if (
      updatedSchedule.length > 0 &&
      updatedSchedule[0].schedule_data &&
      typeof updatedSchedule[0].schedule_data === "string"
    ) {
      try {
        updatedSchedule[0].schedule_data = JSON.parse(
          updatedSchedule[0].schedule_data
        );
      } catch (error) {
        console.error("Erreur lors du parsing des données de planning:", error);
      }
    }

    // Récupérer les informations de l'employé
    const employeeId = employee_id || scheduleExists[0].employee_id;
    const [employeeResult] = await db.query(
      "SELECT first_name, last_name FROM employees WHERE id = ?",
      [employeeId]
    );

    // Enregistrer l'activité et créer une notification
    if (req.user && req.user.id) {
      try {
        const Activity = require("../models/Activity");
        const Notification = require("../models/Notification");

        // Détails de l'employé pour le message
        const employeeName =
          employeeResult.length > 0
            ? `${employeeResult[0].first_name} ${employeeResult[0].last_name}`
            : `Employé #${employeeId}`;

        const weekStartFormatted = week_start || scheduleExists[0].week_start;

        // Log de l'activité
        await Activity.logActivity({
          type: "update",
          entity_type: "schedule",
          entity_id: id,
          description: `Modification du planning de ${employeeName} (semaine du ${weekStartFormatted})`,
          user_id: req.user.id,
        });

        // Créer une notification pour le propriétaire du planning et les administrateurs
        const [managers] = await db.query(
          "SELECT id FROM users WHERE role IN ('admin', 'manager') OR id = ?",
          [employeeId]
        );

        // Notifier chaque personne concernée
        for (const manager of managers) {
          // Ne pas notifier l'utilisateur qui a fait la modification
          if (manager.id !== req.user.id) {
            await Notification.createAndBroadcast({
              user_id: manager.id,
              title: "Planning modifié",
              message: `Le planning de ${employeeName} (semaine du ${weekStartFormatted}) a été modifié`,
              type: "info",
              entity_type: "schedule",
              entity_id: id,
              link: `/weekly-schedule/${weekStartFormatted}`,
            });
          }
        }
      } catch (activityError) {
        console.error(
          "Erreur lors de l'enregistrement de l'activité ou de la notification:",
          activityError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Planning mis à jour",
      schedule: updatedSchedule.length > 0 ? updatedSchedule[0] : null,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du planning:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du planning",
      error: error.message,
    });
  }
};

/**
 * Supprime un planning hebdomadaire existant
 * @param {Request} req - Requête HTTP
 * @param {Response} res - Réponse HTTP
 * @returns {Promise<Response>} Réponse HTTP
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Valider l'ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "ID de planning invalide",
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

    // Supprimer le planning
    await db.query("DELETE FROM weekly_schedules WHERE id = ?", [id]);

    // Enregistrer l'activité
    if (req.user && req.user.id) {
      try {
        const Activity = require("../models/Activity");
        await Activity.logActivity({
          type: "delete",
          entity_type: "schedule",
          entity_id: id,
          description: "Suppression d'un planning",
          user_id: req.user.id,
        });
      } catch (activityError) {
        console.error(
          "Erreur lors de l'enregistrement de l'activité de suppression:",
          activityError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Planning supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du planning:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};
