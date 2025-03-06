const db = require("../config/db");
const WebSocket = require("ws");

/**
 * Modèle pour gérer les activités dans l'application
 */
class Activity {
  /**
   * Récupère toutes les activités avec pagination et filtrage
   * @param {Object} options - Options de filtrage et pagination
   * @returns {Promise<Array>} - Liste des activités
   */
  static async getAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        type,
        entity_type,
        entity_id,
        user_id,
        startDate,
        endDate,
        sortBy = "timestamp",
        sortOrder = "DESC",
      } = options;

      const offset = (page - 1) * limit;

      // Construction de la requête avec filtres
      let query = `
        SELECT a.*, u.first_name, u.last_name
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE 1=1
      `;

      const queryParams = [];

      if (type) {
        query += ` AND a.type = ?`;
        queryParams.push(type);
      }

      if (entity_type) {
        query += ` AND a.entity_type = ?`;
        queryParams.push(entity_type);
      }

      if (entity_id) {
        query += ` AND a.entity_id = ?`;
        queryParams.push(entity_id);
      }

      if (user_id) {
        query += ` AND a.user_id = ?`;
        queryParams.push(user_id);
      }

      if (startDate) {
        query += ` AND a.timestamp >= ?`;
        queryParams.push(startDate);
      }

      if (endDate) {
        query += ` AND a.timestamp <= ?`;
        queryParams.push(endDate);
      }

      // Ajout de l'ordre et de la pagination
      query += ` ORDER BY a.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      const [activities] = await db.query(query, queryParams);

      // Compter le nombre total d'activités pour la pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM activities a
        WHERE 1=1
      `;

      const countParams = [];

      if (type) {
        countQuery += ` AND a.type = ?`;
        countParams.push(type);
      }

      if (entity_type) {
        countQuery += ` AND a.entity_type = ?`;
        countParams.push(entity_type);
      }

      if (entity_id) {
        countQuery += ` AND a.entity_id = ?`;
        countParams.push(entity_id);
      }

      if (user_id) {
        countQuery += ` AND a.user_id = ?`;
        countParams.push(user_id);
      }

      if (startDate) {
        countQuery += ` AND a.timestamp >= ?`;
        countParams.push(startDate);
      }

      if (endDate) {
        countQuery += ` AND a.timestamp <= ?`;
        countParams.push(endDate);
      }

      const [totalResult] = await db.query(countQuery, countParams);
      const total = totalResult[0].total;

      // Transformer les données pour le frontend
      const formattedActivities = activities.map((activity) => {
        let details = {};
        try {
          details = JSON.parse(activity.details);
        } catch (e) {
          details = {};
        }

        return {
          id: activity.id,
          type: activity.type,
          entity_type: activity.entity_type,
          entity_id: activity.entity_id,
          description: activity.description,
          user_id: activity.user_id,
          user: {
            name:
              activity.username ||
              `${activity.first_name} ${activity.last_name}`.trim() ||
              "Utilisateur inconnu",
          },
          ip_address: activity.ip_address,
          user_agent: activity.user_agent,
          timestamp: activity.timestamp,
          details: details,
        };
      });

      return {
        activities: formattedActivities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des activités:", error);
      throw error;
    }
  }

  /**
   * Récupère une activité par son ID
   * @param {number} id - ID de l'activité
   * @returns {Promise<Object>} - Activité trouvée
   */
  static async getById(id) {
    try {
      const [activities] = await db.query(
        `
        SELECT a.*, u.first_name, u.last_name
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
        `,
        [id]
      );

      if (activities.length === 0) {
        throw new Error(`Activité avec l'ID ${id} non trouvée`);
      }

      const activity = activities[0];
      let details = {};
      try {
        details = JSON.parse(activity.details);
      } catch (e) {
        details = {};
      }

      return {
        id: activity.id,
        type: activity.type,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        description: activity.description,
        user_id: activity.user_id,
        user: {
          name:
            activity.username ||
            `${activity.first_name} ${activity.last_name}`.trim() ||
            "Utilisateur inconnu",
        },
        ip_address: activity.ip_address,
        user_agent: activity.user_agent,
        timestamp: activity.timestamp,
        details: details,
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'activité ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crée une nouvelle activité
   * @param {Object} activityData - Données de l'activité
   * @returns {Promise<number>} - ID de l'activité créée
   */
  static async create(activityData) {
    try {
      const {
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        ip_address = null,
        user_agent = null,
        details = {},
      } = activityData;

      // Enregistrer l'activité dans la base de données
      const query = `
        INSERT INTO activities (
          type, 
          entity_type, 
          entity_id, 
          description, 
          user_id, 
          ip_address, 
          user_agent, 
          details, 
          timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await db.query(query, [
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        ip_address,
        user_agent,
        JSON.stringify(details || {}),
      ]);

      // Récupérer l'activité créée pour l'envoyer via WebSocket
      const activity = await this.getById(result.insertId);

      // Notifier tous les clients WebSocket connectés
      if (global.wss) {
        global.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "NEW_ACTIVITY",
                activity,
              })
            );
          }
        });
      }

      return result.insertId;
    } catch (error) {
      console.error("Erreur lors de la création de l'activité:", error);
      throw error;
    }
  }

  /**
   * Supprime les activités plus anciennes qu'une certaine date
   * @param {number} days - Nombre de jours à conserver
   * @returns {Promise<number>} - Nombre d'activités supprimées
   */
  static async cleanupOldActivities(days = 90) {
    try {
      const [result] = await db.query(
        `
        DELETE FROM activities
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
        `,
        [days]
      );

      return result.affectedRows;
    } catch (error) {
      console.error(`Erreur lors du nettoyage des anciennes activités:`, error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'activités
   * @returns {Promise<Object>} - Statistiques d'activités
   */
  static async getStats() {
    try {
      // Nombre total d'activités
      const [totalResult] = await db.query(
        `SELECT COUNT(*) as total FROM activities`
      );

      // Activités par type
      const [typeStats] = await db.query(
        `SELECT type, COUNT(*) as count FROM activities GROUP BY type ORDER BY count DESC`
      );

      // Activités par utilisateur (top 10)
      const [userStats] = await db.query(
        `
        SELECT a.user_id, u.username, u.first_name, u.last_name, COUNT(*) as count 
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.user_id IS NOT NULL
        GROUP BY a.user_id
        ORDER BY count DESC
        LIMIT 10
        `
      );

      // Activités par jour (30 derniers jours)
      const [dailyStats] = await db.query(
        `
        SELECT DATE(timestamp) as date, COUNT(*) as count 
        FROM activities 
        WHERE timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(timestamp)
        ORDER BY date
        `
      );

      return {
        total: totalResult[0].total,
        byType: typeStats,
        byUser: userStats.map((user) => ({
          user_id: user.user_id,
          name:
            user.username ||
            `${user.first_name} ${user.last_name}`.trim() ||
            "Utilisateur inconnu",
          count: user.count,
        })),
        byDay: dailyStats,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques d'activités:",
        error
      );
      throw error;
    }
  }
}

module.exports = Activity;
