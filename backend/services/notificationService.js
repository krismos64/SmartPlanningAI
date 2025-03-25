const { pool } = require("../config/database");
const { wss } = require("../config/websocket");

/**
 * Crée une notification et l'émet via WebSocket
 * @param {Object} io - Instance Socket.IO
 * @param {Object} params - Paramètres de la notification
 * @param {string} params.user_id - ID de l'utilisateur concerné
 * @param {string} params.title - Titre de la notification
 * @param {string} params.message - Message de la notification
 * @param {string} params.type - Type de notification (info, success, warning, error)
 * @param {string} [params.link] - Lien optionnel associé à la notification
 * @returns {Promise<Object>} La notification créée
 */
const createAndEmitNotification = async (
  user_id,
  title,
  message,
  type = "info",
  link = null
) => {
  try {
    const [notif] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
      [user_id, title, message, type, link]
    );

    const [notification] = await pool.query(
      "SELECT * FROM notifications WHERE id = ?",
      [notif.insertId]
    );

    // Émettre la notification via WebSocket si disponible
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.userId === user_id.toString() && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "NOTIFICATION",
              notification: notification[0],
              timestamp: new Date().toISOString(),
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
