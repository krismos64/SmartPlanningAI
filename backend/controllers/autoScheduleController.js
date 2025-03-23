/**
 * Contrôleur pour la génération automatique de planning
 */

const AutoScheduleService = require("../services/autoScheduleService");
const db = require("../db");
const moment = require("moment");

// Instance du service
const autoScheduleService = new AutoScheduleService();

/**
 * Génère automatiquement un planning hebdomadaire optimisé
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.generateSchedule = async (req, res) => {
  try {
    // Récupérer les options depuis le corps de la requête
    const options = req.body;

    // Valider les données requises
    if (!options.weekStart) {
      return res.status(400).json({
        success: false,
        message: "Date de début de semaine requise",
      });
    }

    if (!options.departmentId) {
      return res.status(400).json({
        success: false,
        message: "ID du département requis",
      });
    }

    if (!options.businessHours) {
      return res.status(400).json({
        success: false,
        message: "Heures d'ouverture requises",
      });
    }

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
