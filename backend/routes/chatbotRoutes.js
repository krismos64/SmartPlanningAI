/**
 * Routes pour le chatbot basé sur des règles
 * Gère les requêtes liées au traitement des messages et aux réponses préconfigurées
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { findMatchingRule } = require("../services/chatbotRules");
const scheduleOptimizer = require("../services/scheduleOptimizer");

// Middleware d'authentification
router.use(auth);

/**
 * @route   POST /api/chatbot/process
 * @desc    Traiter un message utilisateur avec le système de règles
 * @access  Private
 */
router.post("/process", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    console.log("User ID reçu dans le chatbot :", userId);

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message requis" });
    }

    console.log(
      `Traitement du message avec le système de règles: "${message.substring(
        0,
        50
      )}..."`
    );

    // Traiter le message avec le système de règles
    const result = await findMatchingRule(message, userId);

    // Format de réponse
    const response = {
      success: true,
      intent: result.intent || "MATCHED_RULE",
      score: 1.0,
      message: result.text || result.error ? "Erreur de traitement" : "",
      entities: {},
      actions: result.actions || [],
      error: result.error || false,
    };

    res.json(response);
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du message",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/chatbot/generate-schedule
 * @desc    Générer un planning optimisé
 * @access  Private
 */
router.post("/generate-schedule", async (req, res) => {
  try {
    const {
      week_start,
      department_id,
      min_hours_per_employee,
      max_hours_per_employee,
      opening_hours,
      employee_ids,
      priority_rules,
    } = req.body;

    // Vérifier les paramètres obligatoires
    if (!week_start) {
      return res.status(400).json({
        success: false,
        message: "Date de début de semaine requise",
      });
    }

    console.log(
      `Demande de génération de planning IA pour la semaine du ${week_start}`
    );

    // Générer le planning avec l'optimiseur
    const result = await scheduleOptimizer.generateOptimizedSchedule({
      weekStart: week_start,
      departmentId: department_id,
      minHoursPerEmployee: min_hours_per_employee,
      maxHoursPerEmployee: max_hours_per_employee,
      openingHours: opening_hours,
      employeeIds: employee_ids,
      priorityRules: priority_rules,
    });

    // Enregistrer l'activité de génération
    try {
      const { recordActivity } = require("./activities");
      await recordActivity({
        type: "ai_generate",
        entity_type: "planning",
        entity_id: "optimized_schedule",
        description: `Génération IA d'un planning pour la semaine du ${week_start}`,
        user_id: req.user ? req.user.id : null,
        details: {
          week_start,
          department_id,
          employee_count: employee_ids ? employee_ids.length : "tous",
          stats: result.stats,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // Continuer malgré l'erreur d'activité
    }

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la génération du planning IA:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du planning",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/user-stats
 * @desc    Obtenir des statistiques personnalisées pour l'utilisateur
 * @access  Private
 */
router.get("/user-stats", async (req, res) => {
  try {
    const userId = req.user.id;
    const connectDB = require("../config/db");

    // Récupérer les statistiques réelles de l'utilisateur à partir de la base de données
    const [vacationStats] = await connectDB.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM vacation_requests 
         WHERE employee_id = ? AND status = 'approved' AND start_date >= CURDATE()) AS upcoming_vacations,
        (SELECT SUM(duration) FROM vacation_requests 
         WHERE employee_id = ? AND status = 'approved' AND 
         YEAR(start_date) = YEAR(CURDATE())) AS used_vacations_this_year
    `,
      [userId, userId]
    );

    const [workStats] = await connectDB.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM weekly_schedule_entries wse 
         JOIN weekly_schedules ws ON wse.schedule_id = ws.id
         WHERE ws.employee_id = ? AND ws.start_date <= CURDATE() AND ws.end_date >= CURDATE()) AS shifts_this_week
    `,
      [userId]
    );

    const [employeeData] = await connectDB.execute(
      `
      SELECT vacation_balance FROM employees WHERE id = ?
    `,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        upcoming_vacations: vacationStats[0].upcoming_vacations || 0,
        used_vacations_this_year:
          vacationStats[0].used_vacations_this_year || 0,
        remaining_vacation_days: employeeData[0]?.vacation_balance || 0,
        shifts_this_week: workStats[0].shifts_this_week || 0,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
});

module.exports = router;
