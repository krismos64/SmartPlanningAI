/**
 * Contrôleur pour la gestion des plannings hebdomadaires
 */

const db = require("../db");
const moment = require("moment");
const WeeklySchedule = require("../models/WeeklySchedule");
const {
  createAndEmitNotification,
} = require("../services/notificationService");

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

    // Si le planning a été sauvegardé avec succès
    if (result && result.success) {
      const statusCode = result.isUpdate ? 200 : 201;

      // Déterminer si c'est une création ou une mise à jour
      const activityType = result.isUpdate ? "update" : "create";
      const actionText = result.isUpdate ? "modification" : "création";

      // Récupérer le nom complet de l'employé pour l'historique
      let employeeName = "";
      try {
        // Récupérer les détails de l'employé pour la notification
        const Employee = require("../models/Employee");
        const employee = await Employee.findById(employee_id);
        if (employee) {
          employeeName = `${employee.first_name} ${employee.last_name}`;

          // Envoyer une notification à l'employé
          const Notification = require("../models/Notification");
          await Notification.create({
            user_id: employee.id,
            title: `Nouveau planning (semaine du ${req.body.week_start})`,
            message: `Votre planning pour la semaine du ${
              req.body.week_start
            } a été ${result.isUpdate ? "mis à jour" : "créé"}.`,
            type: "schedule",
            read: false,
            created_by: req.user ? req.user.id : 1,
          });

          // Envoyer des notifications aux managers
          const managers = await Employee.findManagersByDepartment(
            employee.department
          );
          for (const manager of managers) {
            await Notification.create({
              user_id: manager.id,
              title: `Planning ${
                result.isUpdate ? "modifié" : "créé"
              } (${employeeName})`,
              message: `Le planning de ${employeeName} pour la semaine du ${
                req.body.week_start
              } a été ${result.isUpdate ? "mis à jour" : "créé"}.`,
              type: "schedule",
              read: false,
              created_by: req.user ? req.user.id : 1,
            });
          }
        }
      } catch (notifError) {
        console.error("Erreur lors de l'envoi des notifications:", notifError);
        // Ne pas bloquer la création du planning si l'envoi de notification échoue
      }

      // Enregistrer l'activité
      if (req.user && req.user.id) {
        try {
          const Activity = require("../models/Activity");
          await Activity.logActivity({
            type: activityType,
            entity_type: "schedule",
            entity_id: result.id,
            description: `${actionText} du planning de ${employeeName} (semaine du ${req.body.week_start})`,
            user_id: req.user.id,
          });
          console.log(
            `Activité d'${actionText} enregistrée pour le planning ${result.id}`
          );
        } catch (activityError) {
          console.error(
            `Erreur lors de l'enregistrement de l'activité d'${actionText}:`,
            activityError
          );
          // Ne pas bloquer la création du planning si l'enregistrement de l'activité échoue
        }
      }

      res.status(statusCode).json({
        success: true,
        message: result.message,
        id: result.id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result
          ? result.message
          : "Erreur lors de la création du planning",
        error: result ? result.error : null,
      });
    }
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

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Non autorisé. Utilisateur non authentifié.",
      });
    }

    // Construire la requête SQL de base avec filtrage par user_id de l'entreprise
    let query = `
      SELECT ws.*, e.first_name AS employee_first_name, e.last_name AS employee_last_name, e.role,
             u.first_name AS updater_first_name, u.last_name AS updater_last_name
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN users u ON ws.updated_by = u.id
      WHERE ws.week_start = ?
      AND e.user_id = ?
    `;

    const queryParams = [weekStart, req.user.id];

    // Ajouter le filtre de statut si présent
    if (status) {
      query += " AND ws.status = ?";
      queryParams.push(status);
    }

    // Ajouter le tri
    query += " ORDER BY ws.employee_id";

    // Exécuter la requête
    const [schedules] = await db.query(query, queryParams);

    // Log pour debug
    console.log("🔍 Requête SQL exécutée:", query);
    console.log("🔍 Paramètres:", queryParams);
    console.log("🔍 Nombre de plannings récupérés:", schedules.length);
    if (schedules.length > 0) {
      console.log("🔍 Premier planning - updated_by:", schedules[0].updated_by);
      console.log(
        "🔍 Premier planning - updater_first_name:",
        schedules[0].updater_first_name
      );
      console.log(
        "🔍 Premier planning - updater_last_name:",
        schedules[0].updater_last_name
      );
    }

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

      // Ajouter les informations de l'utilisateur qui a mis à jour le planning
      if (schedule.updated_by) {
        console.log(
          `🔍 Traitement planning ${schedule.id} - updated_by: ${schedule.updated_by}`
        );
        console.log(
          `🔍 Traitement planning ${schedule.id} - updater_first_name: ${schedule.updater_first_name}`
        );
        console.log(
          `🔍 Traitement planning ${schedule.id} - updater_last_name: ${schedule.updater_last_name}`
        );

        schedule.updater_name =
          schedule.updater_first_name && schedule.updater_last_name
            ? `${schedule.updater_first_name} ${schedule.updater_last_name}`
            : `Utilisateur ${schedule.updated_by}`;

        console.log(
          `🔍 Traitement planning ${schedule.id} - updater_name final: ${schedule.updater_name}`
        );
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
      "SELECT first_name, last_name, user_id FROM employees WHERE id = ?",
      [employeeId]
    );

    const employeeName =
      employeeResult.length > 0
        ? `${employeeResult[0].first_name} ${employeeResult[0].last_name}`
        : `Employé #${employeeId}`;

    // Récupérer le user_id de l'employé
    const employeeUserId =
      employeeResult.length > 0 ? employeeResult[0].user_id : null;

    // Créer une notification pour l'employé seulement si un user_id valide existe
    try {
      if (employeeUserId) {
        await createAndEmitNotification(null, {
          user_id: employeeUserId,
          title: "Planning modifié",
          message: `Votre planning a été modifié (semaine du ${week_start})`,
          type: "info",
          link: `/weekly-schedule/${week_start}`,
        });
      } else {
        console.log(
          "Pas de notification envoyée à l'employé : user_id manquant"
        );
      }
    } catch (notifError) {
      console.error("Erreur lors de la création de notification:", notifError);
      // Ne pas bloquer la mise à jour du planning si la notification échoue
    }

    // Créer une notification pour les administrateurs et managers
    const [managers] = await db.query(
      "SELECT id FROM users WHERE role IN ('admin', 'manager')"
    );

    for (const manager of managers) {
      if (manager.id !== req.user.id) {
        await createAndEmitNotification(null, {
          user_id: manager.id,
          title: "Planning modifié",
          message: `Le planning de ${employeeName} a été modifié (semaine du ${week_start})`,
          type: "info",
          link: `/weekly-schedule/${week_start}`,
        });
      }
    }

    // Enregistrer l'activité de modification
    if (req.user && req.user.id) {
      try {
        // Vérifier si cette mise à jour provient d'un appel direct à l'API ou d'une redirection depuis save()
        const isFromSaveMethod = req.body._fromSaveMethod === true;

        // Si ce n'est pas un appel provenant de save(), enregistrer l'activité
        if (!isFromSaveMethod) {
          const Activity = require("../models/Activity");
          await Activity.logActivity({
            type: "update",
            entity_type: "schedule",
            entity_id: id,
            description: `Modification du planning de ${employeeName} (semaine du ${
              week_start || scheduleExists[0].week_start
            })`,
            user_id: req.user.id,
          });
          console.log(
            "Activité de modification enregistrée pour un appel API direct"
          );
        } else {
          console.log(
            "Mise à jour provenant de save(), skip de l'enregistrement d'activité"
          );
        }
      } catch (activityError) {
        console.error(
          "Erreur lors de l'enregistrement de l'activité de modification:",
          activityError
        );
        // Ne pas bloquer la mise à jour du planning si l'enregistrement de l'activité échoue
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
      message: "Erreur lors de la mise à jour du planning",
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
