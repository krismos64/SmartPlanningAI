const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/auth");

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Créer une nouvelle notification
router.post("/", async (req, res) => {
  try {
    const { title, message, type, link, entity_type, entity_id, user_id } =
      req.body;

    // Vérifier les champs obligatoires
    if (!title || !message || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Les champs title, message et user_id sont obligatoires",
      });
    }

    // Créer une nouvelle notification
    const notification = new Notification({
      user_id,
      title,
      message,
      type: type || "info",
      link,
      entity_type,
      entity_id,
    });

    // Enregistrer la notification
    const result = await notification.save();

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "Notification créée avec succès",
        notification: result.notification,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de la notification",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la notification",
      error: error.message,
    });
  }
});

// Récupérer les notifications de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const result = await Notification.getByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === "true",
    });

    if (result.success) {
      res.json({
        success: true,
        notifications: result.notifications,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des notifications",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des notifications",
      error: error.message,
    });
  }
});

// Récupérer le nombre de notifications non lues
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.getUnreadCount(userId);

    if (result.success) {
      res.json({
        success: true,
        count: result.count,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors du comptage des notifications non lues",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors du comptage des notifications non lues:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des notifications non lues",
      error: error.message,
    });
  }
});

// Marquer une notification comme lue
router.put("/:id/read", async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await Notification.markAsRead(notificationId);

    if (result.success) {
      res.json({
        success: true,
        message: "Notification marquée comme lue",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors du marquage de la notification comme lue",
        error: result.error,
      });
    }
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la notification comme lue:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du marquage de la notification comme lue",
      error: error.message,
    });
  }
});

// Marquer toutes les notifications comme lues
router.put("/mark-all-read", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.markAllAsRead(userId);

    if (result.success) {
      res.json({
        success: true,
        message: "Toutes les notifications ont été marquées comme lues",
        affectedRows: result.affectedRows,
      });
    } else {
      res.status(500).json({
        success: false,
        message:
          "Erreur lors du marquage de toutes les notifications comme lues",
        error: result.error,
      });
    }
  } catch (error) {
    console.error(
      "Erreur lors du marquage de toutes les notifications comme lues:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Erreur serveur lors du marquage de toutes les notifications comme lues",
      error: error.message,
    });
  }
});

// Supprimer une notification
router.delete("/:id", async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await Notification.delete(notificationId);

    if (result.success) {
      res.json({
        success: true,
        message: "Notification supprimée avec succès",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la notification",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de la notification",
      error: error.message,
    });
  }
});

// Créer une notification et la diffuser via WebSocket
router.post("/broadcast", async (req, res) => {
  try {
    const { title, message, type, link, entity_type, entity_id, user_ids } =
      req.body;

    // Vérifier les champs obligatoires
    if (
      !title ||
      !message ||
      !user_ids ||
      !Array.isArray(user_ids) ||
      user_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs title, message et user_ids (tableau) sont obligatoires",
      });
    }

    const results = [];
    const errors = [];

    // Créer une notification pour chaque utilisateur
    for (const user_id of user_ids) {
      try {
        const result = await Notification.createAndBroadcast({
          user_id,
          title,
          message,
          type: type || "info",
          link,
          entity_type,
          entity_id,
        });

        if (result.success) {
          results.push(result.notification);
        } else {
          errors.push({ user_id, error: result.error });
        }
      } catch (error) {
        errors.push({ user_id, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${results.length} notifications créées avec succès`,
      notifications: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Erreur lors de la diffusion des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la diffusion des notifications",
      error: error.message,
    });
  }
});

// Supprimer toutes les notifications
router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.deleteAllByUserId(userId);

    if (result.success) {
      res.json({
        success: true,
        message: "Toutes les notifications ont été supprimées",
        affectedRows: result.affectedRows,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression des notifications",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression des notifications",
      error: error.message,
    });
  }
});

module.exports = router;
