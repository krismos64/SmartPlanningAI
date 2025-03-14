const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { auth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const Notification = require("../models/Notification");
const db = require("../config/database");

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

    // Créer une notification pour les activités importantes
    if (
      type === "create" ||
      type === "update" ||
      type === "delete" ||
      type === "approve" ||
      type === "reject"
    ) {
      try {
        // Créer une notification uniquement pour l'utilisateur qui a créé l'activité
        if (userId) {
          console.log(
            `Création d'une notification pour l'utilisateur ${userId}`
          );

          const notificationData = {
            user_id: userId,
            title: `Nouvelle activité: ${type}`,
            message: description,
            type: "info",
            entity_type,
            entity_id: req.body.entity_id || null,
            link: "/",
          };

          const notification = new Notification(notificationData);
          const notifResult = await notification.save();

          if (notifResult.success && global.wss) {
            // Envoyer la notification via WebSocket
            global.wss.sendNotificationToUser(userId, notifResult.notification);
            console.log(`Notification envoyée à l'utilisateur ${userId}`);
          }
        } else {
          console.log(
            "Aucun utilisateur connecté pour envoyer une notification"
          );
        }
      } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
      }
    }

    // Envoyer une notification WebSocket pour informer les clients
    if (global.wss) {
      global.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "ACTIVITY_LOGGED",
              activity: { id: activityId },
              timestamp: new Date().toISOString(),
            })
          );
        }
      });
    }

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
    console.log("Requête d'enregistrement d'activité reçue:", req.body);

    // Vérifier les champs requis
    const { type, entity_type, description } = req.body;
    if (!type || !entity_type || !description) {
      return res.status(400).json({
        success: false,
        message: "Les champs type, entity_type et description sont requis",
      });
    }

    // Récupérer les informations de l'utilisateur à partir du token (si présent)
    let userId = null;
    let userName = "Utilisateur inconnu";

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "smartplanningai_secret_key"
        );
        userId = decoded.userId;

        // Récupérer le nom de l'utilisateur depuis la base de données
        const [users] = await db.query(
          "SELECT first_name, last_name FROM users WHERE id = ?",
          [userId]
        );
        if (users.length > 0) {
          userName = `${users[0].first_name} ${users[0].last_name}`.trim();
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
      }
    }

    // Créer l'objet activité
    const activity = {
      type,
      entity_type,
      entity_id: req.body.entity_id || null,
      description,
      userId,
      userName,
      details: req.body.details || {},
      ipAddress: req.body.ipAddress || req.ip,
      userAgent: req.body.userAgent || req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    };

    // Enregistrer l'activité
    const result = await Activity.logActivity(activity);

    if (result.success) {
      // Créer une notification pour les activités importantes
      if (
        type === "create" ||
        type === "update" ||
        type === "delete" ||
        type === "approve" ||
        type === "reject"
      ) {
        try {
          // Créer une notification uniquement pour l'utilisateur qui a créé l'activité
          if (userId) {
            console.log(
              `Création d'une notification pour l'utilisateur ${userId}`
            );

            const notificationData = {
              user_id: userId,
              title: `Nouvelle activité: ${type}`,
              message: description,
              type: "info",
              entity_type,
              entity_id: req.body.entity_id || null,
              link: "/",
            };

            const notification = new Notification(notificationData);
            const notifResult = await notification.save();

            if (notifResult.success && global.wss) {
              // Envoyer la notification via WebSocket
              global.wss.sendNotificationToUser(
                userId,
                notifResult.notification
              );
              console.log(`Notification envoyée à l'utilisateur ${userId}`);
            }
          } else {
            console.log(
              "Aucun utilisateur connecté pour envoyer une notification"
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors de la création de la notification:",
            error
          );
        }
      }

      // Envoyer une notification WebSocket pour informer les clients
      if (global.wss) {
        global.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "ACTIVITY_LOGGED",
                activity: result.activity,
                timestamp: new Date().toISOString(),
              })
            );
          }
        });
      }

      res.status(201).json({
        success: true,
        message: "Activité enregistrée avec succès",
        activityId: result.activity.id,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'enregistrement de l'activité",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de l'activité",
      error: error.message,
    });
  }
});

module.exports = router;
