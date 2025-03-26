/**
 * Script pour générer de nombreuses notifications de test
 *
 * Utilise le script testNotifications.js pour créer un grand nombre de notifications
 * afin de tester la performance et l'affichage du système de notifications
 */

const { createTestNotification } = require("./testNotifications");
const db = require("../config/db");

// Fonction pour obtenir tous les utilisateurs actifs
async function getActiveUsers() {
  try {
    // Requête modifiée pour obtenir tous les utilisateurs (sans condition status)
    const [users] = await db.query("SELECT id FROM users LIMIT 10");
    if (users && users.length > 0) {
      return users.map((user) => user.id);
    } else {
      console.warn(
        "Aucun utilisateur trouvé, utilisation de l'ID 1 par défaut"
      );
      return [1];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [1]; // Fallback à l'ID 1
  }
}

// Types de contenus possibles pour les notifications
const notificationContents = [
  {
    type: "info",
    titles: [
      "Mise à jour du système",
      "Nouvel employé ajouté",
      "Maintenance planifiée",
      "Rappel de réunion",
      "Mise à jour des procédures",
    ],
    messages: [
      "Une mise à jour du système est prévue pour demain à 18h00.",
      "Un nouvel employé a été ajouté à votre équipe.",
      "Une maintenance est prévue ce weekend.",
      "Rappel: réunion d'équipe demain à 10h00.",
      "Les procédures ont été mises à jour, veuillez les consulter.",
    ],
  },
  {
    type: "success",
    titles: [
      "Objectif atteint",
      "Opération réussie",
      "Projet terminé",
      "Demande approuvée",
      "Employé du mois",
    ],
    messages: [
      "Votre équipe a atteint son objectif mensuel!",
      "L'opération a été réalisée avec succès.",
      "Le projet a été terminé dans les délais.",
      "Votre demande a été approuvée par la direction.",
      "Félicitations! Vous êtes l'employé du mois.",
    ],
  },
  {
    type: "warning",
    titles: [
      "Retard de livraison",
      "Échéance imminente",
      "Stock faible",
      "Absence non justifiée",
      "Vérification requise",
    ],
    messages: [
      "Un retard de livraison est prévu pour la commande #12345.",
      "L'échéance du projet approche rapidement.",
      "Le stock de fournitures est faible, veuillez commander.",
      "Une absence non justifiée a été enregistrée.",
      "Veuillez vérifier les données saisies avant validation.",
    ],
  },
  {
    type: "error",
    titles: [
      "Erreur système",
      "Échec de l'opération",
      "Problème de connexion",
      "Données invalides",
      "Service indisponible",
    ],
    messages: [
      "Une erreur système s'est produite, veuillez contacter le support.",
      "L'opération a échoué, veuillez réessayer.",
      "Un problème de connexion a été détecté.",
      "Les données saisies sont invalides, veuillez les corriger.",
      "Le service est temporairement indisponible.",
    ],
  },
];

// Fonction pour générer un contenu aléatoire
function getRandomContent(type) {
  const contentType = notificationContents.find((c) => c.type === type);
  if (!contentType)
    return { title: "Notification", message: "Contenu de notification" };

  const titleIndex = Math.floor(Math.random() * contentType.titles.length);
  const messageIndex = Math.floor(Math.random() * contentType.messages.length);

  return {
    title: contentType.titles[titleIndex],
    message: contentType.messages[messageIndex],
  };
}

// Fonction pour générer de nombreuses notifications
async function generateMultipleNotifications(count = 20) {
  try {
    console.log(`🔔 Génération de ${count} notifications de test`);
    console.log("-----------------------------------");

    // Récupérer les utilisateurs actifs
    const userIds = await getActiveUsers();
    console.log(`Utilisateurs disponibles pour les tests: ${userIds.length}`);

    const types = ["info", "success", "warning", "error"];
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Générer les notifications
    for (let i = 0; i < count; i++) {
      try {
        // Choisir un utilisateur aléatoire
        const userId = userIds[Math.floor(Math.random() * userIds.length)];

        // Choisir un type aléatoire
        const type = types[Math.floor(Math.random() * types.length)];

        // Obtenir un contenu aléatoire pour ce type
        const content = getRandomContent(type);

        // Créer la notification
        const notificationData = {
          user_id: userId,
          title: content.title,
          message: `${content.message} (Test #${i + 1})`,
          type: type,
          entity_type: "test",
          entity_id: Math.floor(Math.random() * 1000),
          link: "/activities",
        };

        // Ne pas afficher chaque notification pour éviter de surcharger la console
        if (i < 5 || i === count - 1) {
          console.log(
            `Création de la notification #${i + 1}/${count} (${type}):`
          );
        } else if (i === 5) {
          console.log(
            `... création des ${count - 5} notifications restantes ...`
          );
        }

        // Utiliser le modèle pour créer la notification
        const notification = await createTestNotification(userId, type);
        if (notification) {
          successCount++;
          results.push(notification);
        } else {
          errorCount++;
        }

        // Petite pause entre chaque notification pour ne pas surcharger la DB
        if (i % 5 === 0 && i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création de la notification #${i + 1}:`,
          error
        );
        errorCount++;
      }
    }

    console.log("-----------------------------------");
    console.log(
      `✅ Génération terminée: ${successCount} réussies, ${errorCount} échouées`
    );

    return {
      success: true,
      total: count,
      succeeded: successCount,
      failed: errorCount,
      notifications: results.slice(0, 5), // Retourner seulement les 5 premières pour ne pas surcharger la réponse
    };
  } catch (error) {
    console.error("❌ Erreur lors de la génération des notifications:", error);
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
  // Récupérer le nombre de notifications depuis les arguments, par défaut 20
  const count = process.argv[2] ? parseInt(process.argv[2]) : 20;

  generateMultipleNotifications(count)
    .then((result) => {
      if (result.success) {
        console.log(
          `Le script a généré ${result.succeeded}/${result.total} notifications avec succès`
        );
        process.exit(0);
      } else {
        console.error("Le script a échoué:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Erreur non gérée dans le script:", error);
      process.exit(1);
    });
}

module.exports = generateMultipleNotifications;
