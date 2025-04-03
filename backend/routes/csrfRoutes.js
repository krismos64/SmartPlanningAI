const express = require("express");
const router = express.Router();
const crypto = require("crypto");

/**
 * Gestionnaire pour la route /csrf-token
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const handleCsrfToken = (req, res) => {
  // Générer un token CSRF aléatoire
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // Enregistrer le token dans la session si on utilise express-session
  if (req.session) {
    req.session.csrfToken = csrfToken;
  }

  // Envoyer le token dans un cookie non-HTTPOnly pour que JavaScript puisse y accéder
  res.cookie("XSRF-TOKEN", csrfToken, {
    secure: true,
    sameSite: "None",
    httpOnly: false,
    path: "/",
  });

  // Journaliser l'opération pour le debug
  console.log("🔐 [CSRF] Token généré:", csrfToken.substring(0, 10) + "...");

  // Retourner également le token dans la réponse JSON
  res.json({
    success: true,
    csrfToken,
  });
};

/**
 * @route GET /api/csrf/token
 * @desc Génère et retourne un token CSRF
 * @access Public
 */
router.get("/token", handleCsrfToken);

/**
 * @route GET /api/csrf/debug
 * @desc Route de debug pour afficher les cookies
 * @access Public
 */
router.get("/debug", (req, res) => {
  res.json({
    cookies: req.cookies,
    sessionCsrf: req.session?.csrfToken
      ? `${req.session.csrfToken.substring(0, 10)}...`
      : null,
    headers: {
      "x-csrf-token": req.headers["x-csrf-token"],
      cookie: req.headers.cookie,
    },
  });
});

module.exports = router;
// Exporter aussi le gestionnaire directement pour la rétrocompatibilité
module.exports.handle = handleCsrfToken;
