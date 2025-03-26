/**
 * Contrôleur pour la génération automatique de planning
 * @module controllers/autoScheduleController
 */

const AutoScheduleService = require("../services/autoScheduleService");
const db = require("../db");
const moment = require("moment");
const { autoScheduleSchema } = require("../utils/validationSchemas");

// Instance du service
const autoScheduleService = new AutoScheduleService();

/**
 * Génère automatiquement un planning hebdomadaire optimisé
 *
 * @async
 * @function generateSchedule
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de la requête contenant les options de génération
 * @param {string} req.body.weekStart - Date de début de semaine au format YYYY-MM-DD
 * @param {number} req.body.departmentId - ID du département concerné
 * @param {Object} req.body.businessHours - Heures d'ouverture par jour
 * @param {number[]} req.body.businessHours.Monday - Heures d'ouverture lundi [début, fin]
 * @param {number[]} req.body.businessHours.Tuesday - Heures d'ouverture mardi [début, fin]
 * @param {number[]} req.body.businessHours.Wednesday - Heures d'ouverture mercredi [début, fin]
 * @param {number[]} req.body.businessHours.Thursday - Heures d'ouverture jeudi [début, fin]
 * @param {number[]} req.body.businessHours.Friday - Heures d'ouverture vendredi [début, fin]
 * @param {number[]} [req.body.businessHours.Saturday] - Heures d'ouverture samedi [début, fin] (optionnel)
 * @param {number[]} [req.body.businessHours.Sunday] - Heures d'ouverture dimanche [début, fin] (optionnel)
 * @param {Object} [req.body.employeePreferences] - Préférences horaires des employés (optionnel)
 * @param {Object} [req.body.employeePreferences.employeeId] - ID de l'employé comme clé
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Monday] - Préférences pour lundi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Tuesday] - Préférences pour mardi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Wednesday] - Préférences pour mercredi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Thursday] - Préférences pour jeudi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Friday] - Préférences pour vendredi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Saturday] - Préférences pour samedi
 * @param {Array<Object>} [req.body.employeePreferences.employeeId.Sunday] - Préférences pour dimanche
 * @param {string} [req.body.sourceWeek] - Date de début d'une semaine à cloner (optionnel)
 * @param {number} [req.body.minimumEmployees=1] - Nombre minimum d'employés par créneau horaire
 * @param {boolean} [req.body.balanceRoles=true] - Si true, équilibre les rôles
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse HTTP avec planning généré ou message d'erreur
 */
exports.generateSchedule = async (req, res) => {
  try {
    // Valider les données entrantes avec Joi
    const { error, value } = autoScheduleSchema.validate(req.body, {
      abortEarly: false, // Retourner toutes les erreurs, pas seulement la première
      stripUnknown: true, // Supprimer les champs non définis dans le schéma
    });

    // En cas d'erreur de validation
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Données de requête invalides",
        errors: errorMessages,
      });
    }

    // Récupérer les options validées depuis le résultat de la validation
    const options = value;

    // Générer le planning optimisé
    const result = await autoScheduleService.generateWeeklySchedule(options);

    // Sauvegarder les plannings générés dans la base de données
    await Promise.all(
      result.schedule.map(async (entry) => {
        // Calculer la date de fin de semaine (week_end) à partir de week_start
        const weekEnd = moment(entry.week_start)
          .add(6, "days")
          .format("YYYY-MM-DD");

        // Récupérer le total d'heures pour cet employé
        const totalHours = result.stats.total_hours[entry.employee_id] || 0;

        // Insérer le planning dans la base de données
        await db.query(
          `INSERT INTO weekly_schedules 
        (employee_id, week_start, week_end, schedule_data, total_hours, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          schedule_data = VALUES(schedule_data),
          total_hours = VALUES(total_hours),
          status = VALUES(status),
          updated_at = NOW()`,
          [
            entry.employee_id,
            entry.week_start,
            weekEnd,
            JSON.stringify(entry.schedule_data),
            totalHours,
            "draft",
          ]
        );
      })
    );

    // Retourner la réponse avec le planning et les statistiques
    return res.status(200).json({
      success: true,
      data: result.schedule,
      stats: result.stats,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la génération automatique du planning:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération automatique",
      error: error.message,
    });
  }
};
