/**
 * Script simple pour tester la connexion
 * à l'API avec un utilisateur connu
 */

const axios = require("axios");

// URL de base de l'API
const API_URL = "http://localhost:5002";

// Informations d'identification valides
// À remplacer par un utilisateur connu dans votre base de données
const validCredentials = {
  email: "admin@example.com", // ⚠️ À remplacer par un utilisateur réel
  password: "smartplanning", // ⚠️ À remplacer par un mot de passe réel
};

// Fonction pour extraire le CSRF token d'un cookie header
function extractCsrfToken(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "XSRF-TOKEN") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Fonction pour récupérer un token CSRF
async function fetchCsrfToken() {
  try {
    console.log("🔒 Récupération du token CSRF...");
    const response = await axios.get(`${API_URL}/api/csrf-token`, {
      withCredentials: true,
    });

    // Vérifier si le token CSRF est dans les cookies
    const cookies = response.headers["set-cookie"];
    let csrfToken = null;

    if (cookies && cookies.length) {
      for (const cookie of cookies) {
        csrfToken = extractCsrfToken(cookie);
        if (csrfToken) break;
      }
    }

    // Sinon, vérifier s'il est dans la réponse
    if (!csrfToken && response.data && response.data.csrfToken) {
      csrfToken = response.data.csrfToken;
    }

    if (csrfToken) {
      console.log(`✅ Token CSRF récupéré: ${csrfToken.substring(0, 10)}...`);
      return csrfToken;
    } else {
      console.log("⚠️ Aucun token CSRF trouvé");
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token CSRF:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Réponse:", error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

async function testAuthEndpoints() {
  try {
    console.log("🧪 Test simple des endpoints d'authentification");
    console.log("==============================================");

    // 0. Récupérer un token CSRF
    console.log("🔒 Obtention d'un token CSRF...");
    const csrfToken = await fetchCsrfToken();
    console.log("--------------------------------------");

    // 1. Test de l'endpoint /auth/status (non protégé)
    console.log("🔍 Test de GET /api/auth/status...");
    try {
      const statusResponse = await axios.get(`${API_URL}/api/auth/status`);
      console.log("✅ Statut de l'API:", statusResponse.data);
    } catch (error) {
      console.error("❌ Erreur sur /api/auth/status:", error.message);
    }
    console.log("--------------------------------------");

    // 2. Test de l'endpoint /auth/login
    console.log("🔑 Test de POST /api/auth/login...");
    try {
      const config = {
        withCredentials: true,
        headers: {},
      };

      // Ajouter le token CSRF s'il existe
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }

      const loginResponse = await axios.post(
        `${API_URL}/api/auth/login`,
        validCredentials,
        config
      );
      console.log("✅ Connexion réussie!");
      console.log("📋 Réponse:", JSON.stringify(loginResponse.data, null, 2));

      // Récupérer le token pour les tests suivants
      const token = loginResponse.data.accessToken || loginResponse.data.token;
      if (token) {
        console.log(`🔐 Token reçu: ${token.substring(0, 20)}...`);

        // 3. Test de l'endpoint /auth/verify avec le token
        console.log("--------------------------------------");
        console.log("🔍 Test de GET /api/auth/verify (avec token)...");
        try {
          const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("✅ Token valide!");
          console.log("👤 Utilisateur vérifié:", verifyResponse.data);
        } catch (error) {
          console.error("❌ Erreur sur /api/auth/verify:", error.message);
        }
      }
    } catch (error) {
      console.error("❌ Erreur sur /api/auth/login:");
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error("   Réponse:", error.response.data);
      } else {
        console.error("   Erreur:", error.message);
      }
    }

    console.log("==============================================");
    console.log("🏁 Fin des tests");
  } catch (error) {
    console.error("❌ Erreur générale:", error.message);
  }
}

// Exécuter les tests
testAuthEndpoints();
