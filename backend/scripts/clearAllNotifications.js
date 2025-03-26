/**
 * Script pour effacer toutes les notifications
 *
 * Ce script permet de :
 * - Supprimer toutes les notifications d'un utilisateur spécifique
 * - Ou supprimer toutes les notifications de tous les utilisateurs (mode administration)
 */

const db = require("../config/db");
const Notification = require("../models/Notification");

/**
 * Supprime toutes les notifications d'un utilisateur spécifique
 * @param {number} userId - ID de l'utilisateur dont on veut supprimer les notifications
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function clearUserNotifications(userId) {
  try {
    console.log(
      `🔔 Suppression de toutes les notifications de l'utilisateur ${userId}`
    );

    // Vérifier que l'utilisateur existe
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);
    if (!userRows || userRows.length === 0) {
      console.error(`❌ L'utilisateur avec l'ID ${userId} n'existe pas`);
      return {
        success: false,
        message: `L'utilisateur avec l'ID ${userId} n'existe pas`,
      };
    }

    // Compter les notifications de l'utilisateur
    const [countRows] = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ?",
      [userId]
    );
    const count = countRows[0].count;

    if (count === 0) {
      console.log(
        `ℹ️ Aucune notification trouvée pour l'utilisateur ${userId}`
      );
      return {
        success: true,
        deletedCount: 0,
        message: `Aucune notification trouvée pour l'utilisateur ${userId}`,
      };
    }

    // Supprimer les notifications
    const result = await Notification.deleteAllByUserId(userId);

    if (result.success) {
      console.log(
        `✅ ${result.affectedRows} notifications supprimées pour l'utilisateur ${userId}`
      );
      return {
        success: true,
        deletedCount: result.affectedRows,
        message: `${result.affectedRows} notifications supprimées pour l'utilisateur ${userId}`,
      };
    } else {
      console.error(
        `❌ Erreur lors de la suppression des notifications: ${result.error}`
      );
      return {
        success: false,
        message: `Erreur lors de la suppression des notifications: ${result.error}`,
      };
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression des notifications: ${error.message}`
    );
    return {
      success: false,
      message: `Erreur lors de la suppression des notifications: ${error.message}`,
    };
  }
}

/**
 * Supprime toutes les notifications de tous les utilisateurs
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function clearAllNotifications() {
  try {
    console.log(
      "🔔 Suppression de toutes les notifications de tous les utilisateurs"
    );

    // Compter toutes les notifications
    const [countRows] = await db.query(
      "SELECT COUNT(*) as count FROM notifications"
    );
    const count = countRows[0].count;

    if (count === 0) {
      console.log("ℹ️ Aucune notification trouvée dans le système");
      return {
        success: true,
        deletedCount: 0,
        message: "Aucune notification trouvée dans le système",
      };
    }

    // Supprimer toutes les notifications
    const [result] = await db.query("DELETE FROM notifications");

    if (result.affectedRows > 0) {
      console.log(
        `✅ ${result.affectedRows} notifications supprimées du système`
      );
      return {
        success: true,
        deletedCount: result.affectedRows,
        message: `${result.affectedRows} notifications supprimées du système`,
      };
    } else {
      console.error("❌ Erreur lors de la suppression des notifications");
      return {
        success: false,
        message: "Erreur lors de la suppression des notifications",
      };
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression des notifications: ${error.message}`
    );
    return {
      success: false,
      message: `Erreur lors de la suppression des notifications: ${error.message}`,
    };
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  // Récupérer les arguments
  const args = process.argv.slice(2);
  const userId = args[0] ? parseInt(args[0]) : null;

  const operation = userId
    ? clearUserNotifications(userId)
    : clearAllNotifications();

  operation
    .then((result) => {
      if (result.success) {
        console.log(
          `Le script a supprimé ${result.deletedCount} notifications avec succès`
        );
        process.exit(0);
      } else {
        console.error(`Le script a échoué: ${result.message}`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Erreur non gérée dans le script:", error);
      process.exit(1);
    })
    .finally(async () => {
      // Fermer la connexion à la base de données
      await db.end();
    });
}

module.exports = {
  clearUserNotifications,
  clearAllNotifications,
};
