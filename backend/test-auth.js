require("dotenv").config();

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5001/api";

const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateTokens, verifyAccessToken } = require("./utils/tokenUtils");

// Test des routes de profil
const testProfileRoute = async () => {
  try {
    // Utiliser le même ID que celui d'un utilisateur réel
    const userId = 6; // ID de l'utilisateur c.mostefaoui@yahoo.fr

    // Générer un token avec notre utilitaire de génération de tokens
    const tokens = generateTokens(userId, "admin");
    const accessToken = tokens.accessToken;

    console.log("=== GÉNÉRATION DU TOKEN ===");
    console.log(
      "Token généré:",
      accessToken ? accessToken.substring(0, 20) + "..." : "erreur"
    );

    // Petite vérification du token avant de l'utiliser
    const decoded = verifyAccessToken(accessToken);
    console.log(
      "Token décodé:",
      decoded
        ? {
            userId: decoded.userId,
            role: decoded.role || "non spécifié",
          }
        : "Erreur de décodage"
    );

    // Test de la route /api/auth/profile
    console.log("\n=== TEST DE LA ROUTE /api/auth/profile ===");
    console.log("URL de test:", `${API_URL}/auth/profile`);
    console.log(
      "En-tête Authorization:",
      `Bearer ${accessToken.substring(0, 20)}...`
    );

    try {
      const authResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      console.log("\n=== RÉPONSE DU SERVEUR (AUTH) ===");
      console.log("Status:", authResponse.status);
      console.log("Données reçues:", {
        ...authResponse.data,
        profileImage: authResponse.data.profileImage
          ? "[IMAGE PRÉSENTE]"
          : "null",
      });
    } catch (errorAuth) {
      console.error("\n=== ERREUR (AUTH) ===");
      console.error("Statut:", errorAuth.response?.status || "N/A");
      console.error("Message:", errorAuth.message);

      if (errorAuth.response) {
        console.error("Données d'erreur:", errorAuth.response.data);
      }
    }

    // Test de la route /api/user/profile
    console.log("\n=== TEST DE LA ROUTE /api/user/profile ===");
    console.log("URL de test:", `${API_URL}/user/profile`);
    console.log(
      "En-tête Authorization:",
      `Bearer ${accessToken.substring(0, 20)}...`
    );

    try {
      const userResponse = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      console.log("\n=== RÉPONSE DU SERVEUR (USER) ===");
      console.log("Status:", userResponse.status);
      console.log("Données reçues:", {
        ...userResponse.data,
        profileImage: userResponse.data.profileImage
          ? "[IMAGE PRÉSENTE]"
          : "null",
      });
    } catch (errorUser) {
      console.error("\n=== ERREUR (USER) ===");
      console.error("Statut:", errorUser.response?.status || "N/A");
      console.error("Message:", errorUser.message);

      if (errorUser.response) {
        console.error("Données d'erreur:", errorUser.response.data);
      }
    }
  } catch (error) {
    console.error("\n=== ERREUR GÉNÉRALE ===");
    console.error("Message:", error.message);

    if (error.response) {
      console.error("Statut:", error.response.status);
      console.error("Données d'erreur:", error.response.data);
    }
  }
};

// Exécuter le test
testProfileRoute();
