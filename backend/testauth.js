// Test d'authentification et d'inscription avec CSRF
require("dotenv").config({ path: "./.env.development" });
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Configuration
const API_URL = "http://localhost:5001";
const EMAIL = `test-${uuidv4().substring(0, 8)}@example.com`; // Email unique pour éviter les conflits
const PASSWORD = "Password123!";

// Fonction pour effectuer une requête avec gestion des cookies
async function request(
  method,
  endpoint,
  data = null,
  cookies = {},
  headers = {}
) {
  try {
    const url = `${API_URL}${endpoint}`;
    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      withCredentials: true,
      // Axios ne peut pas gérer les cookies directement pour les tests
    };

    if (data) {
      config.data = data;
    }

    console.log(`\n📤 ${method.toUpperCase()} ${url}`);
    if (data) console.log("Données:", JSON.stringify(data, null, 2));
    if (Object.keys(headers).length > 0) console.log("En-têtes:", headers);

    const response = await axios(config);

    console.log(`📥 Statut: ${response.status}`);
    console.log("Réponse:", JSON.stringify(response.data, null, 2));

    // Retourner la réponse et les cookies éventuels
    return {
      data: response.data,
      cookies: response.headers["set-cookie"] || [],
    };
  } catch (error) {
    if (error.response) {
      console.error(`❌ Erreur ${error.response.status}:`, error.response.data);
      return { error: error.response.data, status: error.response.status };
    } else {
      console.error("❌ Erreur:", error.message);
      return { error: error.message };
    }
  }
}

// Tests des fonctionnalités d'authentification
async function runTests() {
  try {
    console.log("🚀 Démarrage des tests d'authentification");
    console.log("Email de test:", EMAIL);

    // 1. Obtenir un token CSRF
    console.log("\n--- 1. Récupération du token CSRF ---");
    const csrfResponse = await request("GET", "/api/csrf-token");
    if (!csrfResponse.data || !csrfResponse.data.csrfToken) {
      throw new Error("Impossible d'obtenir un token CSRF");
    }

    const csrfToken = csrfResponse.data.csrfToken;
    console.log("Token CSRF obtenu:", csrfToken);

    // 2. Inscription avec le token CSRF
    console.log("\n--- 2. Test d'inscription ---");
    const registerResponse = await request(
      "POST",
      "/api/auth/register",
      {
        email: EMAIL,
        password: PASSWORD,
        first_name: "Test",
        last_name: "User",
      },
      {},
      { "X-CSRF-Token": csrfToken }
    );

    // Vérifier si l'inscription a réussi
    if (registerResponse.error) {
      console.log("⚠️ L'inscription a échoué, on essaie de se connecter");
    } else {
      console.log("✅ Inscription réussie");
    }

    // 3. Connexion
    console.log("\n--- 3. Test de connexion ---");
    const loginResponse = await request("POST", "/api/auth/login", {
      email: EMAIL,
      password: PASSWORD,
    });

    // Vérifier si la connexion a réussi
    if (loginResponse.error) {
      throw new Error("Échec de la connexion");
    }

    console.log("✅ Connexion réussie");
    const authToken =
      loginResponse.data.token || loginResponse.data.accessToken;

    // 4. Vérifier l'authentification
    console.log("\n--- 4. Vérification de l'authentification ---");
    const authCheckResponse = await request(
      "GET",
      "/api/auth/check",
      null,
      {},
      { Authorization: `Bearer ${authToken}` }
    );

    if (authCheckResponse.error) {
      throw new Error("Échec de la vérification d'authentification");
    }

    console.log("✅ Vérification d'authentification réussie");

    // 5. Déconnexion
    console.log("\n--- 5. Test de déconnexion ---");
    const logoutResponse = await request(
      "POST",
      "/api/auth/logout",
      null,
      {},
      { Authorization: `Bearer ${authToken}` }
    );

    if (logoutResponse.error) {
      throw new Error("Échec de la déconnexion");
    }

    console.log("✅ Déconnexion réussie");
    console.log("\n🎉 TOUS LES TESTS SONT RÉUSSIS");
  } catch (error) {
    console.error("\n❌ ERREUR LORS DES TESTS:", error.message);
  }
}

// Exécuter les tests
console.log(
  "\n⚠️ ATTENTION: Assurez-vous que le serveur backend est démarré sur http://localhost:5001"
);
console.log(
  "Appuyez sur Ctrl+C pour annuler ou attendez 5 secondes pour lancer les tests..."
);

setTimeout(() => {
  runTests();
}, 5000);
