const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { auth } = require("../middleware/auth");

/**
 * Fonction utilitaire pour enregistrer une activité et notifier les clients WebSocket
 * @param {Object} activityData - Données de l'activité à enregistrer
 * @returns {Promise<number>} - ID de l'activité créée
 */
const recordActivity = async (activityData) => {
  try {
    console.log("recordActivity appelé avec les données:", activityData);

    // Utiliser la nouvelle méthode logActivity qui gère également la diffusion WebSocket
    return await Activity.logActivity(activityData);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

// Exporter la fonction pour qu'elle soit utilisable dans d'autres modules
router.recordActivity = recordActivity;

/**
 * @route   GET /api/activities/test
 * @desc    Route de test pour vérifier si le routeur fonctionne
 * @access  Public
 */
router.get("/test", (req, res) => {
  console.log("Route GET /api/activities/test appelée");
  res.json({ message: "Route de test des activités fonctionnelle" });
});

/**
 * @route GET /api/activities
 * @desc Récupérer toutes les activités récentes avec pagination et filtrage
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sortBy: req.query.sortBy || "timestamp",
      sortOrder: req.query.sortOrder || "DESC",
      excludeSystemActivities: req.query.excludeSystemActivities !== "false", // Par défaut à true sauf si explicitement mis à false
    };

    console.log("Récupération des activités avec options:", options);
    const result = await Activity.getAll(options);

    // Simplifier la structure de la réponse
    if (!result || !result.activities) {
      return res.json([]);
    }

    // Renvoyer directement le tableau d'activités
    res.json(result.activities);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * @route GET /api/activities/:id
 * @desc Récupérer une activité par son ID
 * @access Private
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const activityId = parseInt(req.params.id);

    if (isNaN(activityId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'activité invalide",
      });
    }

    const activity = await Activity.getById(activityId);

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'activité ${req.params.id}:`,
      error
    );

    if (error.message.includes("non trouvée")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'activité",
      error: error.message,
    });
  }
});

/**
 * @route POST /api/activities
 * @desc Enregistrer une nouvelle activité
 * @access Private
 */
router.post("/", auth, async (req, res) => {
  try {
    console.log("Requête POST /api/activities reçue:", {
      body: req.body,
      user: req.user ? { id: req.user.id, role: req.user.role } : null,
    });

    const { type, entity_type, entity_id, description, details } = req.body;

    const userId = req.user.id;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Valider les données
    if (!type || !entity_type || !description) {
      console.log("Validation échouée:", { type, entity_type, description });
      return res.status(400).json({
        success: false,
        message: "Le type, le type d'entité et la description sont requis",
      });
    }

    // Enregistrer l'activité
    console.log("Tentative d'enregistrement de l'activité avec les données:", {
      type,
      entity_type,
      entity_id,
      description,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });

    const activityId = await Activity.create({
      type,
      entity_type,
      entity_id,
      description,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });

    console.log("Activité enregistrée avec succès, ID:", activityId);

    res.status(201).json({
      success: true,
      message: "Activité enregistrée avec succès",
      activityId,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de l'activité",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/activities/stats
 * @desc Récupérer les statistiques d'activités
 * @access Private (Admin)
 */
router.get("/stats", auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Accès non autorisé. Seuls les administrateurs peuvent accéder aux statistiques.",
      });
    }

    const stats = await Activity.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques d'activités:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques d'activités",
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/activities/cleanup
 * @desc Nettoyer les anciennes activités
 * @access Private (Admin)
 */
router.delete("/cleanup", auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Accès non autorisé. Seuls les administrateurs peuvent nettoyer les activités.",
      });
    }

    const days = parseInt(req.query.days) || 90;

    if (days < 30) {
      return res.status(400).json({
        success: false,
        message: "La période de conservation minimale est de 30 jours",
      });
    }

    const deletedCount = await Activity.cleanupOldActivities(days);

    res.json({
      success: true,
      message: `${deletedCount} activités plus anciennes que ${days} jours ont été supprimées`,
      deletedCount,
    });
  } catch (error) {
    console.error("Erreur lors du nettoyage des anciennes activités:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du nettoyage des anciennes activités",
      error: error.message,
    });
  }
});

/**
 * @route POST /api/activities/log
 * @desc Enregistrer une activité depuis le frontend
 * @access Public (avec token optionnel)
 */
router.post("/log", async (req, res) => {
  try {
    console.log("Requête POST /api/activities/log reçue:", {
      body: req.body,
    });

    const {
      type,
      entity_type,
      entity_id,
      description,
      userId,
      userName,
      details,
      timestamp,
    } = req.body;

    // Valider les données
    if (!type || !entity_type || !description) {
      console.log("Validation échouée:", { type, entity_type, description });
      return res.status(400).json({
        success: false,
        message: "Le type, le type d'entité et la description sont requis",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Enregistrer l'activité
    console.log("Tentative d'enregistrement de l'activité avec les données:", {
      type,
      entity_type,
      entity_id,
      description,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });

    const activityId = await Activity.logActivity({
      type,
      entity_type,
      entity_id,
      description,
      user_id: userId,
      user_name: userName,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      timestamp: timestamp || new Date().toISOString(),
    });

    console.log("Activité enregistrée avec succès, ID:", activityId);

    res.status(201).json({
      success: true,
      message: "Activité enregistrée avec succès",
      activityId,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de l'activité",
      error: error.message,
    });
  }
});

module.exports = router;
