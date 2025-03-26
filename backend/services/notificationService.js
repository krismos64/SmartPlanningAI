const { pool } = require("../config/database");
const { wss } = require("../config/websocket");
const { v4: uuidv4 } = require("uuid");

/**
 * Crée une notification et l'émet via WebSocket
 * @param {Object} io - Instance Socket.IO (ignoré actuellement)
 * @param {Object} params - Paramètres de la notification
 * @param {string} params.user_id - ID de l'utilisateur concerné
 * @param {string} params.title - Titre de la notification
 * @param {string} params.message - Message de la notification
 * @param {string} params.type - Type de notification (info, success, warning, error)
 * @param {string} [params.link] - Lien optionnel associé à la notification
 * @returns {Promise<Object>} La notification créée
 */
const createAndEmitNotification = async (
  io, // paramètre ignoré pour compatibilité
  params
) => {
  try {
    // Vérifier si params est un objet valide
    if (!params || typeof params !== "object") {
      console.error("Paramètres de notification invalides:", params);
      return null;
    }

    // Extraire les paramètres
    const {
      user_id,
      title,
      message,
      type = "info",
      link = "/activities",
    } = params;

    // Vérifier les paramètres requis
    if (!user_id) {
      console.warn(
        "Tentative de création de notification sans user_id:",
        params
      );
      return null;
    }

    // Générer un UUID pour l'id
    const notificationId = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    console.log("Création de notification avec les paramètres:", {
      id: notificationId,
      user_id,
      title,
      message,
      type,
      link,
      created_at: now,
    });

    await pool.query(
      "INSERT INTO notifications (id, user_id, title, message, type, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [notificationId, user_id, title, message, type, link, now]
    );

    const [notification] = await pool.query(
      "SELECT * FROM notifications WHERE id = ?",
      [notificationId]
    );

    // Émettre la notification via WebSocket si disponible
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.userId === user_id.toString() && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "NOTIFICATION",
              notification: notification[0],
              timestamp: now,
            })
          );
        }
      });
    }

    return notification[0];
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
};

module.exports = {
  createAndEmitNotification,
};
