/**
 * Middleware de limitation de taux pour protéger contre les attaques par force brute
 */
const rateLimit = require("express-rate-limit");

// Configuration de la limitation pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes au lieu de 15
  max: 20, // 20 requêtes maximum par IP pendant la fenêtre au lieu de 5
  standardHeaders: true, // Renvoie les en-têtes standard `RateLimit-*`
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*`
  message: {
    status: 429,
    success: false,
    message:
      "Trop de tentatives de connexion. Veuillez réessayer dans 5 minutes.",
  },
});

module.exports = {
  authLimiter,
};
