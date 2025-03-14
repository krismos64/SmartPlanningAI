const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class Notification {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type || "info"; // info, success, warning, error
    this.read = data.read || false;
    this.link = data.link || null;
    this.entity_type = data.entity_type || null; // employee, vacation, schedule, etc.
    this.entity_id = data.entity_id || null;
    this.created_at = data.created_at || new Date().toISOString();
  }

  // Créer une nouvelle notification
  async save() {
    try {
      const query = `
        INSERT INTO notifications (
          id, user_id, title, message, type, \`read\`, link, entity_type, entity_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        this.id,
        this.user_id,
        this.title,
        this.message,
        this.type,
        this.read ? 1 : 0,
        this.link,
        this.entity_type,
        this.entity_id,
        this.created_at,
      ];

      const result = await db.query(query, params);

      return {
        success: true,
        id: this.id,
        notification: this,
      };
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(id) {
    try {
      const query = "UPDATE notifications SET `read` = 1 WHERE id = ?";
      const result = await db.query(query, [id]);

      return {
        success: true,
        affectedRows: result.affectedRows,
      };
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  static async markAllAsRead(userId) {
    try {
      const query = "UPDATE notifications SET `read` = 1 WHERE user_id = ?";
      const result = await db.query(query, [userId]);

      return {
        success: true,
        affectedRows: result.affectedRows,
      };
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Récupérer les notifications d'un utilisateur
  static async getByUserId(userId, options = {}) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;

      let query = "SELECT * FROM notifications WHERE user_id = ?";

      if (unreadOnly) {
        query += " AND `read` = 0";
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

      const notifications = await db.query(query, [userId, limit, offset]);

      return {
        success: true,
        notifications: notifications.map((n) => new Notification(n)),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Récupérer le nombre de notifications non lues d'un utilisateur
  static async getUnreadCount(userId) {
    try {
      const query =
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = 0";
      const result = await db.query(query, [userId]);

      return {
        success: true,
        count: result[0].count,
      };
    } catch (error) {
      console.error(
        "Erreur lors du comptage des notifications non lues:",
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Supprimer une notification
  static async delete(id) {
    try {
      const query = "DELETE FROM notifications WHERE id = ?";
      const result = await db.query(query, [id]);

      return {
        success: true,
        affectedRows: result.affectedRows,
      };
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Supprimer toutes les notifications d'un utilisateur
  static async deleteAllByUserId(userId) {
    try {
      const query = "DELETE FROM notifications WHERE user_id = ?";
      const result = await db.query(query, [userId]);

      return {
        success: true,
        affectedRows: result.affectedRows,
      };
    } catch (error) {
      console.error("Erreur lors de la suppression des notifications:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Créer une notification et la diffuser via WebSocket
  static async createAndBroadcast(data) {
    try {
      const notification = new Notification(data);
      const result = await notification.save();

      if (result.success && global.wss) {
        // Diffuser la notification aux clients connectés
        global.wss.clients.forEach((client) => {
          if (client.userId === data.user_id && client.readyState === 1) {
            client.send(
              JSON.stringify({
                type: "NEW_NOTIFICATION",
                notification: notification,
              })
            );
          }
        });
      }

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la création et diffusion de la notification:",
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = Notification;
