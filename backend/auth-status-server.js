/**
 * Mini-serveur pour tester la route de statut d'authentification
 */

const express = require("express");
const app = express();
const PORT = 5002;

// Middleware pour le parsing JSON
app.use(express.json());

// Middleware pour simuler les cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Route de statut de l'API d'authentification
app.get("/api/auth/status", (req, res) => {
  res.status(200).json({
    status: "active",
    message: "Service d'authentification fonctionnel",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Route pour récupérer un token CSRF
app.get("/api/csrf-token", (req, res) => {
  // Générer un token CSRF simple pour les tests
  const csrfToken = "test-csrf-token-" + Date.now();

  // Définir le cookie
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  // Renvoyer également le token dans la réponse
  res.json({
    success: true,
    csrfToken: csrfToken,
  });
});

// Route de login simulée
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Vérifier que le CSRF token est bien fourni
  const csrfToken = req.headers["x-csrf-token"];
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: "Accès refusé - Token CSRF manquant",
      error: "CSRF_TOKEN_MISSING",
    });
  }

  // Connexion simulée
  const token = "test-jwt-token-" + Date.now();

  // Renvoyer une réponse simulée
  res.json({
    success: true,
    accessToken: token,
    token: token, // Pour la rétrocompatibilité
    user: {
      id: 1,
      email: email || "admin@example.com",
      role: "admin",
      first_name: "Admin",
      last_name: "Test",
    },
  });
});

// Route pour vérifier un token
app.get("/api/auth/verify", (req, res) => {
  // Extraire le token de l'en-tête Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(200).json({
      isAuthenticated: false,
      message: "Aucun token d'authentification fourni",
    });
  }

  // Dans un cas réel, on vérifierait le token ici
  // Pour notre test, on renvoie simplement une réponse positive
  res.json({
    isAuthenticated: true,
    user: {
      _id: 1,
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "Test",
      role: "admin",
      photoUrl: null,
    },
  });
});

// Route de ping générale
app.get("/ping", (req, res) => {
  res.status(200).json({
    message: "API en ligne",
    timestamp: new Date().toISOString(),
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Mini-serveur de test démarré sur http://localhost:${PORT}`);
  console.log(`📌 Routes disponibles:`);
  console.log(`   - GET /api/auth/status`);
  console.log(`   - GET /api/csrf-token`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET /api/auth/verify`);
  console.log(`   - GET /ping`);
  console.log(`\n💡 Pour tester, exécutez: node simple-login-test.js`);
});
