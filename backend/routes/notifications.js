const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/auth");

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

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
