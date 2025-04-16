const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { verifyToken } = require("../middleware/auth");
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

// On définit la route test dans un routeur séparé pour qu'elle soit accessible
// Ce routeur est monté directement sans middlware d'authentification
const testRouter = express.Router();

/**
 * @route   GET /api/activities/test
 * @desc    Route de test pour vérifier si le routeur fonctionne
 * @access  Public
 */
testRouter.get("/", (req, res) => {
  console.log("Route GET /api/activities/test appelée");
  res.json({
    success: true,
    message: "Route de test des activités fonctionnelle",
    timestamp: new Date().toISOString(),
  });
});

// Exporter le routeur de test pour les routes publiques
router.testRouter = testRouter;

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
 * @route GET /api/activities/stats
 * @desc Récupérer les statistiques d'activités
 * @access Private (Admin)
 */
router.get("/stats", verifyToken, async (req, res) => {
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
 * @route GET /api/activities/user/:userId
 * @desc Récupérer toutes les activités d'un utilisateur spécifique
 * @access Privé
 */
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Vérifier si l'utilisateur demande ses propres activités ou s'il a des droits d'admin
    const requestingUserId = req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "Vous n'êtes pas autorisé à voir les activités d'autres utilisateurs",
      });
    }

    // Récupérer les options de pagination et de filtrage depuis la requête
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      type: req.query.type,
      entity_type: req.query.entity_type,
      sortBy: req.query.sortBy || "timestamp",
      sortOrder: req.query.sortOrder || "DESC",
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    // Utiliser la méthode du modèle pour récupérer les activités de l'utilisateur
    const result = await Activity.getByUser(userId, options);

    // Retourner les données avec le format standardisé
    return res.json({
      success: true,
      message: `Activités de l'utilisateur récupérées avec succès`,
      data: result,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des activités de l'utilisateur:`,
      error
    );
    return res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des activités: ${error.message}`,
    });
  }
});

/**
 * @route DELETE /api/activities/cleanup
 * @desc Nettoyer les anciennes activités
 * @access Private (Admin)
 */
router.delete("/cleanup", verifyToken, async (req, res) => {
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
 * @route GET /api/activities/:id
 * @desc Récupérer une activité par son ID
 * @access Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Récupération de l'activité avec ID: ${id}`);

    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ error: "ID d'activité invalide ou manquant" });
    }

    const activity = await Activity.getById(parseInt(id));
    if (!activity) {
      return res
        .status(404)
        .json({ error: `Activité avec l'ID ${id} non trouvée` });
    }

    res.json(activity);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'activité ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * @route POST /api/activities
 * @desc Créer une nouvelle activité
 * @access Privé (nécessite authentification)
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    // Valider les champs obligatoires
    const { type, entity_type, description } = req.body;

    if (!type || !entity_type || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs type, entity_type et description sont obligatoires",
      });
    }

    // Récupérer les détails de l'utilisateur à partir du token
    const userId = req.user ? req.user.id : null;
    const userAgent = req.headers["user-agent"];
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Traiter les détails (s'ils sont fournis)
    let details = req.body.details || {};

    // Si les détails sont une chaîne, essayer de les parser en JSON
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (error) {
        // Si le parsing échoue, utiliser la chaîne telle quelle
        console.error("Erreur lors du parsing des détails:", error);
      }
    }

    console.log("Enregistrement d'une nouvelle activité:", {
      type,
      entity_type,
      entity_id: req.body.entity_id,
      description,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });

    const activityId = await Activity.create({
      type,
      entity_type,
      entity_id: req.body.entity_id,
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

          // Générer un titre plus spécifique selon le type d'entité
          let title = `Nouvelle activité: ${type}`;

          if (entity_type === "employee" && type === "update") {
            title = "Modification d'employé";

            // Cas spécial pour les modifications de solde horaire
            if (
              details &&
              details.action &&
              (details.action === "Ajout d'heures" ||
                details.action === "Soustraction d'heures")
            ) {
              title = "Modification de solde horaire";
            }
          } else if (entity_type === "vacation") {
            title = "Activité de congé";
          } else if (entity_type === "schedule") {
            title = "Modification de planning";
          }

          const notificationData = {
            user_id: userId,
            title: title,
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
    console.error("Erreur lors de la création de l'activité:", error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la création de l'activité: ${error.message}`,
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

    // Récupérer les détails de la requête
    let details = req.body.details || {};

    // Si les détails sont une chaîne, essayer de les parser en JSON
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (error) {
        console.error("Erreur lors du parsing des détails:", error);
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
      details,
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

            // Générer un titre plus spécifique selon le type d'entité
            let title = `Nouvelle activité: ${type}`;

            if (entity_type === "employee" && type === "update") {
              title = "Modification d'employé";

              // Cas spécial pour les modifications de solde horaire
              if (
                details &&
                details.action &&
                (details.action === "Ajout d'heures" ||
                  details.action === "Soustraction d'heures")
              ) {
                title = "Modification de solde horaire";
              }
            } else if (entity_type === "vacation") {
              title = "Activité de congé";
            } else if (entity_type === "schedule") {
              title = "Modification de planning";
            }

            const notificationData = {
              user_id: userId,
              title: title,
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
