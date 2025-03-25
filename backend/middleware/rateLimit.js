/**
 * Middleware de limitation de taux pour protéger contre les attaques par force brute
 */
const rateLimit = require("express-rate-limit");

// Configuration de la limitation pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes maximum par IP pendant la fenêtre
  standardHeaders: true, // Renvoie les en-têtes standard `RateLimit-*`
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*`
  message: {
    status: 429,
    success: false,
    message:
      "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
});

module.exports = {
  authLimiter,
};
