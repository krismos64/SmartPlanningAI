/**
 * Script de test manuel pour vérifier le comportement du chatbot SmartPlanningAI
 *
 * Ce script permet de tester manuellement le chatbot avec différents types de questions :
 * 1. Questions standards (FAQ interne)
 * 2. Questions personnalisées qui nécessitent des données dynamiques depuis la base MySQL
 *
 * Exécution :
 * - Assurez-vous que le serveur backend est en cours d'exécution
 * - node __tests__/manuel-test-chatbot.js
 */

const fetch = require("node-fetch");
const readline = require("readline");

// Configuration
const API_URL = "http://localhost:3000/api";
let authToken = null;

// Interface de ligne de commande
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction d'authentification
async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: username, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.success && data.token) {
      authToken = data.token;
      console.log("Authentification réussie ✅");
      return true;
    } else {
      console.error("Échec de l'authentification:", data.message);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return false;
  }
}

// Fonction pour envoyer un message au chatbot
async function sendMessage(message) {
  if (!authToken) {
    console.error("Vous devez vous authentifier avant d'envoyer des messages");
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/chatbot/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message }),
      credentials: "include",
    });

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return null;
  }
}

// Fonction pour exécuter une action du chatbot
async function executeAction(action) {
  if (!authToken) {
    console.error("Vous devez vous authentifier avant d'exécuter des actions");
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/chatbot/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action }),
      credentials: "include",
    });

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'exécution de l'action:", error);
    return null;
  }
}

// Questions standards pour tester le chatbot (FAQ)
const standardQuestions = [
  "Bonjour",
  "Comment ça va ?",
  "J'ai besoin d'aide",
  "Comment modifier mon profil ?",
  "Comment créer un planning ?",
  "Comment poser un congé ?",
  "Merci",
];

// Questions personnalisées nécessitant des données de la base de données
const dynamicQuestions = [
  "Qui ne travaille pas aujourd'hui ?",
  "Qui travaille aujourd'hui ?",
  "Quelles sont les horaires des employés aujourd'hui ?",
  "Qui sont les prochaines personnes en congés ?",
  "Qui a son solde d'heures positif ?",
  "Qui a son solde d'heures négatif ?",
  "Quel est mon solde de congés ?",
  "Montre-moi mon planning",
];

// Menu principal
function showMainMenu() {
  console.log("\n=== TEST DU CHATBOT SMARTPLANNINGAI ===");
  console.log("1. Se connecter");
  console.log("2. Tester les questions standards (FAQ)");
  console.log("3. Tester les questions avec données dynamiques");
  console.log("4. Mode conversation libre");
  console.log("5. Quitter");

  rl.question("\nChoisissez une option (1-5): ", async (answer) => {
    switch (answer) {
      case "1":
        await handleLogin();
        break;
      case "2":
        await testStandardQuestions();
        break;
      case "3":
        await testDynamicQuestions();
        break;
      case "4":
        await startFreeConversation();
        break;
      case "5":
        console.log("Au revoir !");
        rl.close();
        return;
      default:
        console.log("Option invalide, veuillez réessayer.");
        showMainMenu();
        break;
    }
  });
}

// Gérer la connexion
async function handleLogin() {
  rl.question("Email: ", (username) => {
    rl.question("Mot de passe: ", async (password) => {
      const success = await login(username, password);
      if (success) {
        console.log("Utilisateur connecté en tant que:", username);
      }
      showMainMenu();
    });
  });
}

// Tester les questions standards
async function testStandardQuestions() {
  console.log("\n=== TEST DES QUESTIONS STANDARDS (FAQ) ===");

  if (!authToken) {
    console.log("⚠️ Vous devez vous connecter d'abord");
    showMainMenu();
    return;
  }

  for (const question of standardQuestions) {
    console.log(`\n👤 Q: ${question}`);
    const response = await sendMessage(question);

    if (response && response.success) {
      console.log(`🤖 R: ${response.message || "(pas de message direct)"}`);

      if (response.actions && response.actions.length > 0) {
        console.log(`🔄 Actions: ${response.actions.join(", ")}`);
      }
    } else {
      console.log("❌ Erreur de réponse");
    }

    // Petite pause pour la lisibilité
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  rl.question("\nAppuyez sur Entrée pour continuer...", () => {
    showMainMenu();
  });
}

// Tester les questions avec données dynamiques
async function testDynamicQuestions() {
  console.log("\n=== TEST DES QUESTIONS AVEC DONNÉES DYNAMIQUES ===");

  if (!authToken) {
    console.log("⚠️ Vous devez vous connecter d'abord");
    showMainMenu();
    return;
  }

  for (const question of dynamicQuestions) {
    console.log(`\n👤 Q: ${question}`);
    const response = await sendMessage(question);

    if (response && response.success) {
      console.log(`🤖 R: ${response.message || "(pas de message direct)"}`);

      // Si des actions sont retournées, les exécuter
      if (response.actions && response.actions.length > 0) {
        console.log(`🔄 Actions: ${response.actions.join(", ")}`);

        for (const action of response.actions) {
          console.log(`\n⚙️ Exécution de l'action: ${action}`);
          const actionResult = await executeAction(action);

          if (actionResult && actionResult.success) {
            console.log("✅ Résultat de l'action:");
            if (actionResult.response) {
              console.log(`📄 Réponse: ${actionResult.response}`);
            }

            if (actionResult.data && Array.isArray(actionResult.data)) {
              console.log(`📊 Données (${actionResult.data.length} éléments):`);
              actionResult.data.forEach((item, index) => {
                console.log(`  ${index + 1}. ${JSON.stringify(item)}`);
              });
            }
          } else {
            console.log("❌ Erreur lors de l'exécution de l'action");
          }
        }
      }
    } else {
      console.log("❌ Erreur de réponse");
    }

    // Petite pause pour la lisibilité
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  rl.question("\nAppuyez sur Entrée pour continuer...", () => {
    showMainMenu();
  });
}

// Mode conversation libre
async function startFreeConversation() {
  console.log("\n=== MODE CONVERSATION LIBRE ===");
  console.log('Tapez "exit" ou "quit" pour revenir au menu principal');

  if (!authToken) {
    console.log("⚠️ Vous devez vous connecter d'abord");
    showMainMenu();
    return;
  }

  const askQuestion = () => {
    rl.question("\n👤 Vous: ", async (input) => {
      if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
        showMainMenu();
        return;
      }

      const response = await sendMessage(input);

      if (response && response.success) {
        console.log(`🤖 IA: ${response.message || "(pas de message direct)"}`);

        // Si des actions sont retournées, les exécuter
        if (response.actions && response.actions.length > 0) {
          console.log(`🔄 Actions: ${response.actions.join(", ")}`);

          for (const action of response.actions) {
            console.log(`\n⚙️ Exécution de l'action: ${action}`);
            const actionResult = await executeAction(action);

            if (actionResult && actionResult.success) {
              console.log("✅ Résultat de l'action:");
              if (actionResult.response) {
                console.log(`📄 Réponse: ${actionResult.response}`);
              }

              if (actionResult.data && Array.isArray(actionResult.data)) {
                console.log(
                  `📊 Données (${actionResult.data.length} éléments):`
                );
                actionResult.data.forEach((item, index) => {
                  console.log(`  ${index + 1}. ${JSON.stringify(item)}`);
                });
              }
            } else {
              console.log("❌ Erreur lors de l'exécution de l'action");
            }
          }
        }
      } else {
        console.log("❌ Erreur de réponse");
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Démarrer le programme
console.log("=== Script de test du chatbot SmartPlanningAI ===");
showMainMenu();

// Gestion de la fermeture propre
process.on("SIGINT", () => {
  console.log("\nFermeture du script de test");
  rl.close();
  process.exit(0);
});
