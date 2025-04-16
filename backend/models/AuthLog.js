const db = require("../config/db");

/**
 * Modèle pour les logs d'authentification
 * Permet de suivre les tentatives de connexion, vérifications de token, etc.
 */
class AuthLog {
  /**
   * Crée un nouveau log d'authentification
   * @param {Object} logData - Données du log d'authentification
   * @param {string} logData.email - Email utilisé pour la tentative
   * @param {string} logData.ip - Adresse IP de l'utilisateur
   * @param {string} logData.status - Statut de la tentative ('success', 'failed', 'error', etc.)
   * @param {string} logData.message - Message détaillant la tentative
   * @param {string} logData.user_agent - User-Agent du client
   * @param {string} logData.path - Chemin de la requête
   * @param {string} logData.method - Méthode HTTP utilisée
   * @returns {Promise<Object>} Log créé
   */
  static async create({
    email,
    ip,
    status,
    message,
    user_agent,
    path,
    method,
    user_id,
    token_fragment,
  }) {
    try {
      const query = `
        INSERT INTO auth_logs (email, ip_address, status, message, user_agent, path, method, user_id, token_fragment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        email || "inconnu",
        ip,
        status,
        message,
        user_agent,
        path,
        method,
        user_id || null,
        token_fragment || null,
      ]);

      return {
        id: result.insertId,
        email,
        ip,
        status,
        message,
        user_agent,
        path,
        method,
        created_at: new Date(),
      };
    } catch (error) {
      console.error(
        "Erreur lors de la création du log d'authentification:",
        error
      );
      // Ne pas planter le processus d'authentification si la journalisation échoue
      return null;
    }
  }

  /**
   * Récupère les derniers logs d'authentification
   * @param {number} limit - Nombre de logs à récupérer
   * @returns {Promise<Array>} Liste des logs
   */
  static async getRecent(limit = 100) {
    try {
      const query = `
        SELECT *
        FROM auth_logs
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [logs] = await db.execute(query, [limit]);
      return logs;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs d'authentification:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les logs d'authentification pour un email spécifique
   * @param {string} email - Email à rechercher
   * @param {number} limit - Nombre de logs à récupérer
   * @returns {Promise<Array>} Liste des logs
   */
  static async getByEmail(email, limit = 50) {
    try {
      const query = `
        SELECT *
        FROM auth_logs
        WHERE email = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [logs] = await db.execute(query, [email, limit]);
      return logs;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs pour l'email:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les logs d'authentification pour une adresse IP spécifique
   * @param {string} ip - Adresse IP à rechercher
   * @param {number} limit - Nombre de logs à récupérer
   * @returns {Promise<Array>} Liste des logs
   */
  static async getByIp(ip, limit = 50) {
    try {
      const query = `
        SELECT *
        FROM auth_logs
        WHERE ip_address = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [logs] = await db.execute(query, [ip, limit]);
      return logs;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs pour l'IP:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les logs d'authentification pour un statut spécifique
   * @param {string} status - Statut à rechercher
   * @param {number} limit - Nombre de logs à récupérer
   * @returns {Promise<Array>} Liste des logs
   */
  static async getByStatus(status, limit = 50) {
    try {
      const query = `
        SELECT *
        FROM auth_logs
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [logs] = await db.execute(query, [status, limit]);
      return logs;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs par statut:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les échecs d'authentification récents pour un email
   * @param {string} email - Email à rechercher
   * @param {number} minutes - Intervalle de temps en minutes
   * @returns {Promise<number>} Nombre d'échecs
   */
  static async getRecentFailureCount(email, minutes = 30) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM auth_logs
        WHERE email = ?
          AND status = 'failed'
          AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;

      const [result] = await db.execute(query, [email, minutes]);
      return result[0].count;
    } catch (error) {
      console.error("Erreur lors du comptage des échecs récents:", error);
      throw error;
    }
  }
}

module.exports = AuthLog;
