/**
 * Script de débogage pour le serveur backend
 * Affiche plus de détails sur les erreurs liées à Passport et Google OAuth
 */

// Activer les logs détaillés
process.env.DEBUG = "passport:*,express:*";

// Charger les variables d'environnement
require("dotenv").config();

// S'assurer que nous sommes en mode développement
process.env.NODE_ENV = "development";

// Désactiver la vérification SSL pour le développement local
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("🔍 Mode de débogage activé");
console.log("🌐 Environnement:", process.env.NODE_ENV);
console.log(
  "📂 Variables d'environnement chargées:",
  process.env.DB_HOST ? "✓" : "✗"
);
console.log(
  "🔑 Google Client ID présent:",
  process.env.GOOGLE_CLIENT_ID ? "✓" : "✗"
);

// Charger le serveur
try {
  console.log("🚀 Démarrage du serveur en mode débogage...");
  require("./server");
} catch (error) {
  console.error("💥 ERREUR FATALE AU DÉMARRAGE:", error);
  console.error("Stack trace:", error.stack);
}
