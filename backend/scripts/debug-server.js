// Script pour démarrer le serveur avec plus de logs
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");
const authRoutes = require("../routes/auth");

// Créer l'application Express
const app = express();

// Connecter à la base de données
connectDB();

// Configuration CORS simplifiée
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de journalisation détaillée
app.use((req, res, next) => {
  console.log(`\n🔍 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));

  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "***";
    console.log("📦 Body:", JSON.stringify(sanitizedBody, null, 2));
  }

  // Capturer la réponse
  const originalSend = res.send;
  res.send = function (body) {
    console.log(
      `\n📤 [${new Date().toISOString()}] Response ${res.statusCode}:`
    );
    try {
      const parsedBody = JSON.parse(body);
      const sanitizedBody = { ...parsedBody };
      if (sanitizedBody.token) sanitizedBody.token = "***";
      console.log(JSON.stringify(sanitizedBody, null, 2));
    } catch (e) {
      console.log("Non-JSON response");
    }
    return originalSend.call(this, body);
  };

  next();
});

// Routes d'authentification uniquement
app.use("/api/auth", authRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "Serveur de débogage en cours d'exécution" });
});

// Gestion des erreurs améliorée
app.use((err, req, res, next) => {
  console.error("\n❌ Erreur serveur:", err);
  console.error("📚 Stack trace:", err.stack);

  res.status(500).json({
    error: "Une erreur est survenue",
    message: err.message || "Erreur interne du serveur",
    path: req.path,
    method: req.method,
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur de débogage démarré sur le port ${PORT}`);
  console.log(`📝 Logs détaillés activés`);
  console.log(
    `🔐 Routes d'authentification disponibles sur http://localhost:${PORT}/api/auth`
  );
});

// Gérer les erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("\n💥 Erreur non capturée:", error);
  console.error("📚 Stack trace:", error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n💥 Promesse rejetée non gérée:", reason);
  console.error("📚 Promise:", promise);
});
