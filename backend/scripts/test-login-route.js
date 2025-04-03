// Utilisation de la syntaxe CommonJS pour la compatibilité
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testLoginRoute() {
  console.log("🔍 Test de la route de connexion");

  const PORT = process.env.PORT || 5001;
  const loginUrl = `http://localhost:${PORT}/api/auth/login`;

  console.log(`URL de connexion: ${loginUrl}`);

  // Données de connexion
  const loginData = {
    email: "admin@admin.fr",
    password: "admin",
  };

  console.log("Données de connexion:", {
    email: loginData.email,
    password: "***", // Masquer le mot de passe dans les logs
  });

  try {
    console.log("\n📡 Envoi de la requête...");

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include",
    });

    console.log(
      "📡 Statut de la réponse:",
      response.status,
      response.statusText
    );
    console.log(
      "📡 Headers de la réponse:",
      Object.fromEntries([...response.headers])
    );

    // Tenter de récupérer le corps de la réponse en JSON
    try {
      const responseData = await response.json();
      console.log(
        "📡 Corps de la réponse:",
        JSON.stringify(responseData, null, 2)
      );

      if (responseData.token) {
        console.log("✅ Connexion réussie avec token JWT");
      } else {
        console.log("❌ Connexion réussie mais sans token JWT");
      }
    } catch (jsonError) {
      console.error(
        "❌ Erreur lors de la lecture de la réponse JSON:",
        jsonError.message
      );

      // Tenter de lire le corps comme texte
      const textResponse = await response.text();
      console.log("📡 Corps de la réponse (texte):", textResponse);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la requête:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testLoginRoute();
