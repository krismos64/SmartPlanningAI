require("dotenv").config();

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5001/api";

// Utiliser import() dynamique pour node-fetch
(async () => {
  const fetch = (await import("node-fetch")).default;

  async function testAuthRoute() {
    try {
      console.log("🔍 Test de la route d'authentification");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@admin.fr",
          password: "admin",
        }),
      });

      console.log("📊 Statut de la réponse:", response.status);

      const data = await response.text();
      try {
        // Essayer de parser en JSON
        const jsonData = JSON.parse(data);
        console.log("📋 Réponse JSON:", jsonData);
      } catch (e) {
        // Si ce n'est pas du JSON, afficher le texte brut
        console.log("📝 Réponse texte:", data);
      }
    } catch (error) {
      console.error("❌ Erreur lors du test:", error);
    }
  }

  await testAuthRoute();
})();
