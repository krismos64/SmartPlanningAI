/**
 * Point d'entrée principal de l'application backend
 * Configure et lance le serveur Express
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const routes = require("./routes");
const { NlpManager } = require("node-nlp");

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

// Configurer le répertoire de logs
const logDirectory = path.join(__dirname, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Créer un stream de rotation de logs
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

// Configuration des middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("combined", { stream: accessLogStream }));

// Log des requêtes en développement
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Configurer les routes API
app.use("/api", routes);

// Route de test pour vérifier que le serveur est en ligne
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "API en ligne" });
});

// Route 404 pour les chemins non trouvés
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur serveur",
  });
});

// Initialiser un gestionnaire NLP global pour le partager entre les requêtes
// Cette initialisation est maintenant optionnelle puisque nous utilisons un système basé sur des règles
global.nlpManager = null;

// Fonction d'initialisation du serveur
async function initializeServer() {
  try {
    // Vérifier la connexion à la base de données
    const connectDB = require("./config/db");
    const [result] = await connectDB.execute("SELECT 1");

    if (result) {
      console.log("🔌 Connexion à la base de données établie avec succès");
    }

    // Initialiser le moteur NLP si nécessaire (nous gardons cette partie pour la rétrocompatibilité)
    try {
      const nlpManager = new NlpManager({ languages: ["fr"] });

      // Charge un modèle entraîné s'il existe
      if (fs.existsSync("./model.nlp")) {
        await nlpManager.load("./model.nlp");
        console.log("✓ Modèle NLP chargé avec succès");
        global.nlpManager = nlpManager;
      } else {
        console.log(
          "ℹ Aucun modèle NLP trouvé, le système de règles sera utilisé"
        );
      }
    } catch (nlpError) {
      console.warn(
        "⚠ Impossible d'initialiser le NLP, le système de règles sera utilisé:",
        nlpError.message
      );
    }

    // Configurer le port
    const PORT = process.env.PORT || 3001;

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📝 Mode : ${process.env.NODE_ENV || "production"}`);
      console.log(`🌐 API accessible à http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du serveur:", error);
    process.exit(1);
  }
}

// Lancer l'initialisation du serveur
initializeServer();

module.exports = app;
