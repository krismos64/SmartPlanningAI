/**
 * Routes pour le chatbot IA
 * Gère les requêtes liées au traitement du langage naturel et à la génération de plannings
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const nlpService = require("../services/nlpService");
const scheduleOptimizer = require("../services/scheduleOptimizer");

// Middleware d'authentification
router.use(auth);

/**
 * @route   POST /api/chatbot/process
 * @desc    Traiter un message utilisateur avec NLP
 * @access  Private
 */
router.post("/process", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message requis" });
    }

    console.log(
      `Traitement NLP pour le message: "${message.substring(0, 50)}..."`
    );

    // Traiter le message avec le service NLP
    const result = await nlpService.processMessage(message);

    res.json(result);
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
 * @route   POST /api/chatbot/suggest-modifications
 * @desc    Suggérer des modifications à un planning existant
 * @access  Private
 */
router.post("/suggest-modifications", async (req, res) => {
  try {
    const { schedule_id, constraints } = req.body;

    if (!schedule_id) {
      return res.status(400).json({
        success: false,
        message: "ID de planning requis",
      });
    }

    // Ici, implémentez la logique pour suggérer des améliorations à un planning existant
    // Pour l'instant, on renvoie une réponse simulée

    res.json({
      success: true,
      message: "Suggestions générées",
      suggestions: [
        {
          type: "redistribution",
          description:
            "Redistribuer les heures pour équilibrer la charge de travail",
          changes: [
            { employee_id: 1, add_hours: 2, remove_hours: 0 },
            { employee_id: 2, add_hours: 0, remove_hours: 2 },
          ],
        },
        {
          type: "optimization",
          description: "Optimiser pour réduire les shifts courts",
          changes: [
            {
              employee_id: 3,
              merge_shifts: ["2023-06-12", "morning", "afternoon"],
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Erreur lors de la suggestion de modifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suggestion de modifications",
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

    // Ici, implémentez la logique pour récupérer les statistiques de l'utilisateur
    // Pour l'instant, on renvoie une réponse simulée

    res.json({
      success: true,
      stats: {
        hours_worked_this_week: 32,
        hours_worked_this_month: 128,
        remaining_vacation_days: 15,
        upcoming_shifts: 3,
        performance_rating: 4.5,
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
