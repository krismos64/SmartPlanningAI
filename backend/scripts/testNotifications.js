/**
 * Script pour tester les notifications
 *
 * Ce script permet de :
 * - Créer différents types de notifications
 * - Vérifier leur affichage
 * - Tester le marquage comme lu
 * - Tester la suppression
 */

const Notification = require("../models/Notification");
const db = require("../config/db");

// Types de notifications possibles
const NOTIFICATION_TYPES = ["info", "success", "warning", "error"];

// Fonction pour générer un ID d'utilisateur aléatoire existant dans la base de données
async function getRandomUserId() {
  try {
    const [users] = await db.query("SELECT id FROM users LIMIT 5");
    if (users && users.length > 0) {
      // Sélectionner un utilisateur aléatoire parmi les résultats
      const randomIndex = Math.floor(Math.random() * users.length);
      return users[randomIndex].id;
    } else {
      // Utiliser l'ID 1 comme fallback (supposant que c'est l'admin)
      console.warn(
        "Aucun utilisateur trouvé, utilisation de l'ID 1 par défaut"
      );
      return 1;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération d'un utilisateur aléatoire:",
      error
    );
    return 1; // Fallback à l'ID 1
  }
}

// Fonction pour créer une notification de test
async function createTestNotification(userId, type = "info") {
  try {
    // Vérifier que le type est valide
    if (!NOTIFICATION_TYPES.includes(type)) {
      console.warn(
        `Type de notification invalide: ${type}. Utilisation de 'info' par défaut.`
      );
      type = "info";
    }

    // Générer un contenu aléatoire
    const currentDate = new Date().toLocaleTimeString();
    const titles = {
      info: "Information importante",
      success: "Opération réussie",
      warning: "Attention requise",
      error: "Erreur détectée",
    };

    const messages = {
      info: `Ceci est une notification d'information de test (${currentDate})`,
      success: `Action complétée avec succès (${currentDate})`,
      warning: `Une action requiert votre attention (${currentDate})`,
      error: `Une erreur s'est produite dans le système (${currentDate})`,
    };

    // Créer l'objet notification
    const notificationData = {
      user_id: userId,
      title: titles[type],
      message: messages[type],
      type: type,
      entity_type: "test",
      entity_id: Math.floor(Math.random() * 1000),
      link: "/activities", // Toutes les notifications pointent vers la page d'activités
    };

    console.log(
      `Création d'une notification de type ${type}:`,
      notificationData
    );

    // Utiliser le modèle pour créer la notification
    const notification = new Notification(notificationData);
    const result = await notification.save();

    if (result.success) {
      console.log(
        `✅ Notification de type ${type} créée avec succès. ID: ${result.id}`
      );
      return result.notification;
    } else {
      console.error(
        `❌ Échec de la création de la notification de type ${type}:`,
        result.error
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création de la notification de type ${type}:`,
      error
    );
    return null;
  }
}

// Fonction pour marquer une notification comme lue
async function markNotificationAsRead(notificationId) {
  try {
    const result = await Notification.markAsRead(notificationId);
    if (result.success) {
      console.log(`✅ Notification ${notificationId} marquée comme lue`);
      return true;
    } else {
      console.error(
        `❌ Échec du marquage de la notification ${notificationId} comme lue:`,
        result.error
      );
      return false;
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors du marquage de la notification ${notificationId} comme lue:`,
      error
    );
    return false;
  }
}

// Fonction pour supprimer une notification
async function deleteNotification(notificationId) {
  try {
    const result = await Notification.delete(notificationId);
    if (result.success) {
      console.log(`✅ Notification ${notificationId} supprimée`);
      return true;
    } else {
      console.error(
        `❌ Échec de la suppression de la notification ${notificationId}:`,
        result.error
      );
      return false;
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression de la notification ${notificationId}:`,
      error
    );
    return false;
  }
}

// Fonction pour tester toutes les fonctionnalités des notifications
async function testNotifications() {
  try {
    console.log("🔔 Début des tests de notifications");
    console.log("-----------------------------------");

    // Récupérer un ID utilisateur aléatoire
    const userId = await getRandomUserId();
    console.log(`ID utilisateur pour les tests: ${userId}`);

    // Créer une notification de chaque type
    const notifications = [];
    for (const type of NOTIFICATION_TYPES) {
      const notification = await createTestNotification(userId, type);
      if (notification) {
        notifications.push(notification);
      }
    }

    console.log("-----------------------------------");
    console.log(`✅ Notifications créées: ${notifications.length}`);

    // Attendre 2 secondes
    console.log(
      "Pause de 2 secondes pour vérifier les notifications dans l'interface..."
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Marquer une notification aléatoire comme lue
    if (notifications.length > 0) {
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const randomNotification = notifications[randomIndex];
      console.log(
        `Test de marquage comme lu: notification ${randomNotification.id} (${randomNotification.type})`
      );
      await markNotificationAsRead(randomNotification.id);
    }

    // Attendre 2 secondes
    console.log(
      "Pause de 2 secondes pour vérifier le changement de statut dans l'interface..."
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Supprimer une notification aléatoire
    if (notifications.length > 1) {
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const randomNotification = notifications[randomIndex];
      console.log(
        `Test de suppression: notification ${randomNotification.id} (${randomNotification.type})`
      );
      await deleteNotification(randomNotification.id);
      notifications.splice(randomIndex, 1);
    }

    console.log("-----------------------------------");
    console.log("✅ Tests de notifications terminés avec succès");

    return {
      success: true,
      notifications: notifications,
    };
  } catch (error) {
    console.error("❌ Erreur lors des tests de notifications:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // Fermer la connexion à la base de données
    await db.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testNotifications()
    .then((result) => {
      if (result.success) {
        console.log("Le script de test s'est terminé avec succès");
        process.exit(0);
      } else {
        console.error("Le script de test a échoué:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Erreur non gérée dans le script de test:", error);
      process.exit(1);
    });
}

module.exports = {
  createTestNotification,
  markNotificationAsRead,
  deleteNotification,
  testNotifications,
};
