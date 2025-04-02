const db = require("../config/db");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

/**
 * Modèle pour gérer les activités dans l'application
 */
class Activity {
  /**
   * Récupère toutes les activités avec pagination et filtrage
   * @param {Object} options - Options de filtrage et pagination
   * @returns {Promise<Object>} - Objet contenant les activités et la pagination
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
        excludeSystemActivities = true,
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

      // Exclure les activités système si demandé
      if (excludeSystemActivities) {
        query += ` AND (
          (a.entity_type IN ('employee', 'vacation', 'planning', 'department', 'user', 'project', 'task'))
          OR (a.type IN ('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'register'))
        )`;
      }

      // Ajout de l'ordre et de la pagination
      query += ` ORDER BY a.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), parseInt(offset));

      console.log("Exécution de la requête SQL pour récupérer les activités:", {
        query,
        params: queryParams,
      });

      const [activities] = await db.query(query, queryParams);

      // S'assurer que activities est un tableau
      if (!activities || !Array.isArray(activities)) {
        console.error(
          "Erreur: La requête n'a pas renvoyé un tableau d'activités:",
          activities
        );
        return {
          activities: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }

      console.log(`${activities.length} activités récupérées`);

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

      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      // Transformer les données pour le frontend
      const formattedActivities = activities.map((activity) => {
        let details = {};
        try {
          if (activity.details && typeof activity.details === "string") {
            details = JSON.parse(activity.details);
          } else if (activity.details) {
            details = activity.details;
          }
        } catch (e) {
          console.error("Erreur lors du parsing des détails de l'activité:", e);
          details = {};
        }

        // Utiliser la description formatée si la description originale est vide ou contient "undefined"
        let description = activity.description;
        if (!description || description.includes("undefined")) {
          description = this.formatActivityDescription({
            ...activity,
            details,
          });
        }

        return {
          id: activity.id,
          type: activity.type,
          entity_type: activity.entity_type,
          entity_id: activity.entity_id,
          description: description,
          user_id: activity.user_id,
          user: {
            name:
              activity.username ||
              `${activity.first_name || ""} ${
                activity.last_name || ""
              }`.trim() ||
              "Utilisateur inconnu",
          },
          ip_address: activity.ip_address,
          user_agent: activity.user_agent,
          timestamp: activity.timestamp,
          details: details,
        };
      });

      // Ajouter les métadonnées de pagination aux activités
      const result = {
        activities: formattedActivities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return result;
    } catch (error) {
      console.error("Erreur lors de la récupération des activités:", error);
      // En cas d'erreur, retourner un objet avec un tableau vide et une pagination vide
      return {
        activities: [],
        pagination: {
          page: parseInt(options.page) || 1,
          limit: parseInt(options.limit) || 50,
          total: 0,
          totalPages: 0,
        },
      };
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

      console.log("Activity.create appelé avec les données:", {
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        ip_address,
        user_agent,
        details:
          typeof details === "string"
            ? "String (length: " + details.length + ")"
            : details,
      });

      // Préparer les détails pour l'insertion dans la base de données
      let detailsJson;
      try {
        if (typeof details === "string") {
          // Vérifier si c'est déjà une chaîne JSON valide
          JSON.parse(details);
          detailsJson = details;
        } else {
          // Convertir l'objet en chaîne JSON
          detailsJson = JSON.stringify(details || {});
        }
      } catch (error) {
        console.error(
          "Erreur lors de la conversion des détails en JSON:",
          error
        );
        detailsJson = JSON.stringify({});
      }

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

      console.log("Exécution de la requête SQL:", query);
      console.log("Paramètres:", [
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        ip_address,
        user_agent,
        detailsJson,
      ]);

      const [result] = await db.query(query, [
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        ip_address,
        user_agent,
        detailsJson,
      ]);

      console.log("Résultat de l'insertion:", result);

      // Récupérer l'activité créée pour l'envoyer via WebSocket
      const activity = await this.getById(result.insertId);
      console.log("Activité récupérée:", activity);

      // Notifier tous les clients WebSocket connectés
      if (global.wss) {
        console.log("Diffusion de la nouvelle activité via WebSocket");
        global.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "NEW_ACTIVITY",
                activity,
                timestamp: new Date().toISOString(),
              })
            );
          }
        });

        // Envoyer également la liste mise à jour des activités récentes
        this.broadcastRecentActivities();
      }

      return result.insertId;
    } catch (error) {
      console.error("Erreur lors de la création de l'activité:", error);
      throw error;
    }
  }

  /**
   * Enregistre une nouvelle activité
   * @param {Object} activityData - Données de l'activité
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  static async logActivity(
    type,
    entity_type,
    entity_id,
    description,
    user_id = null,
    details = null,
    ip_address = null,
    user_agent = null
  ) {
    try {
      // Validation des paramètres requis
      if (!type || !entity_type) {
        throw new Error(
          "Le type et entity_type sont requis pour l'enregistrement d'une activité"
        );
      }

      // Conversion des détails en JSON si nécessaire
      let detailsJson = details;
      if (details && typeof details === "object") {
        detailsJson = JSON.stringify(details);
      }

      // Requête SQL avec des valeurs par défaut pour les champs NULL
      const query = `
        INSERT INTO activities (
          type, entity_type, entity_id, description, 
          user_id, details, ip_address, user_agent, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        type,
        entity_type,
        entity_id || 0,
        description || "Activité système",
        user_id,
        detailsJson,
        ip_address,
        user_agent,
      ];

      console.log("Paramètres de logActivity:", values);

      const [result] = await db.query(query, values);

      if (!result || !result.insertId) {
        throw new Error("Échec de l'enregistrement de l'activité");
      }

      console.log("Activité enregistrée avec succès:", {
        id: result.insertId,
        type,
        entity_type,
        entity_id,
        description,
        user_id,
        details: detailsJson,
        timestamp: new Date(),
      });

      return result.insertId;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      throw error;
    }
  }

  /**
   * Diffuse les activités récentes à tous les clients WebSocket
   * @param {number} limit - Nombre d'activités à récupérer
   * @returns {Promise<void>}
   */
  static async broadcastRecentActivities(limit = 10) {
    try {
      if (!global.wss) {
        console.warn(
          "WebSocket non disponible pour la diffusion des activités"
        );
        return;
      }

      console.log("Récupération des activités récentes...");
      const result = await this.getAll({
        limit,
        excludeSystemActivities: true, // Exclure les activités système
      });

      if (!result || !result.activities || result.activities.length === 0) {
        console.log("Aucune activité récente à diffuser");
        return;
      }

      console.log(`${result.activities.length} activités récupérées`);

      // Diffuser les activités à tous les clients connectés
      let clientCount = 0;
      global.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(
              JSON.stringify({
                type: "ACTIVITIES",
                data: result.activities,
                pagination: result.pagination,
                timestamp: new Date().toISOString(),
              })
            );
            clientCount++;
          } catch (error) {
            console.error(
              "Erreur lors de l'envoi des activités au client:",
              error
            );
          }
        }
      });

      console.log(`Activités diffusées à ${clientCount} clients`);
    } catch (error) {
      console.error(
        "Erreur lors de la diffusion des activités récentes:",
        error
      );
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

  /**
   * Formate une description d'activité en fonction de son type et de ses détails
   * @param {Object} activity - Activité à formater
   * @returns {string} - Description formatée
   */
  static formatActivityDescription(activity) {
    try {
      if (!activity) return "";

      const { type, entity_type, entity_id, description, details } = activity;

      // Si une description personnalisée est fournie, l'utiliser directement
      if (description) {
        return description;
      }

      // Formater le type d'entité
      const entityName =
        {
          employee: "un employé",
          schedule: "un planning",
          vacation: "une demande de congé",
          shift: "un horaire",
          user: "un utilisateur",
        }[entity_type] || entity_type;

      // Formater le type d'action
      const actionType =
        {
          create: "a créé",
          update: "a modifié",
          delete: "a supprimé",
          approve: "a approuvé",
          reject: "a rejeté",
          vacation_status_update: "a mis à jour le statut de",
        }[type] || type;

      // Construire la description
      let formattedDescription = `Un utilisateur ${actionType} ${entityName}`;

      // Ajouter des détails si disponibles
      if (details) {
        let parsedDetails;
        try {
          parsedDetails =
            typeof details === "string" ? JSON.parse(details) : details;
        } catch (e) {
          parsedDetails = details;
        }

        // Cas spécial pour les modifications de solde d'heures
        if (
          entity_type === "employee" &&
          parsedDetails.action &&
          (parsedDetails.action === "Ajout d'heures" ||
            parsedDetails.action === "Soustraction d'heures")
        ) {
          const userName = parsedDetails.userName || "Un utilisateur";
          const employeeName =
            parsedDetails.employeeName || `Employé #${entity_id}`;
          const hours = parsedDetails.hours || "?";
          const action =
            parsedDetails.action === "Ajout d'heures" ? "ajouté" : "soustrait";

          return `${userName} a ${action} ${hours}h au solde d'heures de ${employeeName}`;
        }

        // Cas spécial pour les demandes de congés
        if (entity_type === "vacation") {
          const userName =
            activity.first_name && activity.last_name
              ? `${activity.first_name} ${activity.last_name}`
              : "Un utilisateur";

          // Pour la création de congés
          if (
            type === "create" &&
            parsedDetails.employee_id &&
            parsedDetails.start_date &&
            parsedDetails.end_date
          ) {
            const employeeName =
              parsedDetails.employee_name ||
              `Employé #${parsedDetails.employee_id}`;
            const typeConge = parsedDetails.type || "non spécifié";
            const startDate = new Date(
              parsedDetails.start_date
            ).toLocaleDateString("fr-FR");
            const endDate = new Date(parsedDetails.end_date).toLocaleDateString(
              "fr-FR"
            );

            return `${userName} a créé une demande de congé ${typeConge} pour ${employeeName} du ${startDate} au ${endDate}`;
          }

          // Pour la mise à jour du statut des congés
          if (
            type === "vacation_status_update" &&
            parsedDetails.previous_status &&
            parsedDetails.new_status
          ) {
            const previousStatus = parsedDetails.previous_status;
            const newStatus = parsedDetails.new_status;
            const employeeName =
              parsedDetails.employee_name ||
              `Employé #${parsedDetails.employee_id || entity_id}`;
            const approverName = parsedDetails.approver_name || userName;

            let statusText = "";
            if (newStatus === "approved") statusText = "approuvé";
            else if (newStatus === "rejected") statusText = "rejeté";
            else if (newStatus === "pending") statusText = "remis en attente";

            let dateRange = "";
            if (parsedDetails.start_date && parsedDetails.end_date) {
              const startDate = new Date(
                parsedDetails.start_date
              ).toLocaleDateString("fr-FR");
              const endDate = new Date(
                parsedDetails.end_date
              ).toLocaleDateString("fr-FR");
              dateRange = ` du ${startDate} au ${endDate}`;
            }

            return `Demande de congés ${statusText}e pour ${employeeName} ${statusText} par ${approverName}${dateRange}`;
          }

          // Pour la mise à jour générale des congés
          if (type === "update") {
            const employeeName =
              parsedDetails && parsedDetails.employee_name
                ? parsedDetails.employee_name
                : parsedDetails && parsedDetails.employee_id
                ? `Employé #${parsedDetails.employee_id}`
                : `#${entity_id}`;

            let dateRange = "";
            if (
              parsedDetails &&
              parsedDetails.start_date &&
              parsedDetails.end_date
            ) {
              const startDate = new Date(
                parsedDetails.start_date
              ).toLocaleDateString("fr-FR");
              const endDate = new Date(
                parsedDetails.end_date
              ).toLocaleDateString("fr-FR");
              dateRange = ` du ${startDate} au ${endDate}`;
            }

            return `${userName} a modifié la demande de congé pour ${employeeName}${dateRange}`;
          }

          // Pour la suppression des congés
          if (type === "delete") {
            const employeeName =
              parsedDetails && parsedDetails.employee_name
                ? parsedDetails.employee_name
                : parsedDetails && parsedDetails.employee_id
                ? `Employé #${parsedDetails.employee_id}`
                : `#${entity_id}`;

            let dateRange = "";
            if (
              parsedDetails &&
              parsedDetails.start_date &&
              parsedDetails.end_date
            ) {
              const startDate = new Date(
                parsedDetails.start_date
              ).toLocaleDateString("fr-FR");
              const endDate = new Date(
                parsedDetails.end_date
              ).toLocaleDateString("fr-FR");
              dateRange = ` du ${startDate} au ${endDate}`;
            }

            return `${userName} a supprimé la demande de congé pour ${employeeName}${dateRange}`;
          }
        }

        // Pour les autres types d'activités
        if (typeof parsedDetails === "string") {
          formattedDescription += ` : ${parsedDetails}`;
        } else if (typeof parsedDetails === "object") {
          if (parsedDetails.employeeName && entity_type === "employee") {
            formattedDescription += ` : ${parsedDetails.employeeName}`;
          }
        }
      }

      return formattedDescription;
    } catch (error) {
      console.error("Erreur lors du formatage de la description:", error);
      return "Activité inconnue";
    }
  }

  /**
   * Récupère toutes les activités d'un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Promise<Object>} - Activités de l'utilisateur et métadonnées
   */
  static async getByUser(userId, options = {}) {
    try {
      if (!userId) {
        throw new Error("L'ID de l'utilisateur est requis");
      }

      // Utiliser la méthode getAll existante avec le user_id spécifié
      const userOptions = {
        ...options,
        user_id: userId,
        // Assurer une limite raisonnable pour les performances
        limit: options.limit || 100,
        page: options.page || 1,
        // Par défaut, trier par date la plus récente
        sortBy: options.sortBy || "timestamp",
        sortOrder: options.sortOrder || "DESC",
      };

      console.log(
        `Récupération des activités pour l'utilisateur ID: ${userId} avec options:`,
        userOptions
      );

      return await this.getAll(userOptions);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des activités pour l'utilisateur ${userId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = Activity;
