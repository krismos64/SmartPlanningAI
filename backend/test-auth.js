const axios = require("axios");

// URL de base de l'API
const API_URL = "http://localhost:5001/api";

// Informations d'identification de test
const credentials = {
  email: "test@example.com",
  password: "password123",
};

// Fonction pour extraire le CSRF token du cookie
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
    const response = await axios.get(`${API_URL}/csrf-token`, {
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

// Fonction pour tester la connexion
async function testLogin(csrfToken) {
  try {
    console.log("🔑 Tentative de connexion...");

    const config = {
      withCredentials: true,
      headers: {},
    };

    // Ajouter le token CSRF s'il existe
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await axios.post(
      `${API_URL}/auth/login`,
      credentials,
      config
    );

    console.log("✅ Connexion réussie!");
    console.log("📋 Réponse:", JSON.stringify(response.data, null, 2));

    // Récupérer le token d'accès
    const token = response.data.accessToken || response.data.token;

    if (token) {
      console.log(`🔐 Token reçu: ${token.substring(0, 20)}...`);
      return token;
    } else {
      console.log("⚠️ Aucun token reçu dans la réponse");
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Réponse:", error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Fonction pour tester la vérification du token
async function testVerify(token) {
  try {
    if (!token) {
      console.log("⚠️ Pas de token à vérifier");
      return false;
    }

    console.log("🔍 Vérification du token...");
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    console.log("✅ Token valide!");
    console.log("👤 Utilisateur:", response.data.user || response.data);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Réponse:", error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Fonction pour tester la déconnexion
async function testLogout(token, csrfToken) {
  try {
    console.log("🚪 Tentative de déconnexion...");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };

    // Ajouter le token CSRF s'il existe
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await axios.post(`${API_URL}/auth/logout`, {}, config);

    console.log("✅ Déconnexion réussie!");
    console.log("📋 Réponse:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Réponse:", error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Fonction principale pour exécuter les tests
async function runTests() {
  console.log("🧪 DÉBUT DES TESTS D'AUTHENTIFICATION");
  console.log("======================================");

  // Récupérer un token CSRF
  const csrfToken = await fetchCsrfToken();
  console.log("--------------------------------------");

  // Test de connexion
  const token = await testLogin(csrfToken);
  console.log("--------------------------------------");

  // Test de vérification
  if (token) {
    await testVerify(token);
    console.log("--------------------------------------");

    // Test de déconnexion
    await testLogout(token, csrfToken);
  }

  console.log("======================================");
  console.log("🏁 FIN DES TESTS D'AUTHENTIFICATION");
}

// Créer un intercepteur pour extraire les cookies des réponses
axios.interceptors.response.use((response) => {
  if (response.headers["set-cookie"]) {
    const cookies = response.headers["set-cookie"];
    const csrfToken = cookies.find((cookie) => cookie.includes("XSRF-TOKEN="));
    if (csrfToken) {
      console.log("🍪 Cookie XSRF-TOKEN reçu dans la réponse");
    }
  }
  return response;
});

// Exécuter les tests
runTests();
