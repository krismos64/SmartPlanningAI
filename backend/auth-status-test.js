/**
 * Script simple pour tester la route de statut d'authentification
 * Cette route doit être publique et ne nécessite pas d'authentification
 */

const axios = require("axios");

// URL de base
const API_URL = "http://localhost:5002";

async function testAuthStatus() {
  console.log("🧪 Test de la route de statut d'authentification");
  console.log("==============================================");

  try {
    // Test de l'endpoint avec le chemin complet
    console.log("🔍 Tentative GET /api/auth/status...");
    const response = await axios.get(`${API_URL}/api/auth/status`);

    console.log("✅ Statut HTTP:", response.status);
    console.log("📋 Réponse:", JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Erreur:");

    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.error(`   Status: ${error.response.status}`);
      console.error("   Réponse:", error.response.data);
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue
      console.error("   Erreur de connexion - aucune réponse reçue");
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error("   Erreur:", error.message);
    }

    return false;
  } finally {
    console.log("==============================================");
  }
}

// Exécuter le test
testAuthStatus().then((success) => {
  if (success) {
    console.log("🎉 Test réussi - La route /api/auth/status est fonctionnelle");
  } else {
    console.log(
      "❌ Test échoué - Vérifiez l'implémentation de la route /api/auth/status"
    );

    // Informations sur la configuration du serveur
    console.log("\nℹ️ Suggestions pour résoudre le problème:");
    console.log(
      "1. Vérifiez que le serveur est en cours d'exécution sur http://localhost:5002"
    );
    console.log(
      "2. Assurez-vous que la route est bien définie dans routes/auth.js"
    );
    console.log(
      "3. Vérifiez que la route est bien montée dans app.js sous '/api/auth'"
    );
    console.log("4. Redémarrez le serveur après avoir modifié les fichiers");
  }
});
