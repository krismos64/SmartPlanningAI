const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { generateCSRFToken } = require("../middleware/csrfMiddleware");

/**
 * Gestionnaire pour la route /csrf-token
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const handleCsrfToken = (req, res) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  if (req.session) {
    req.session.csrfToken = csrfToken;
    console.log(
      "🔐 [CSRF] Token généré et stocké en session:",
      csrfToken.substring(0, 10) + "..."
    );
  } else {
    console.warn("⚠️ [CSRF] Session non disponible pour stocker le token");
  }

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
router.get("/csrf/token", handleCsrfToken);

/**
 * @route GET /api/csrf-token
 * @desc Génère et retourne un token CSRF (nouvelle route)
 * @access Public
 */
router.get("/csrf-token", generateCSRFToken, (req, res) => {
  // Le middleware generateCSRFToken a déjà généré et stocké le token
  const csrfToken = res.locals.csrfToken;

  // Log pour confirmer que le token est généré correctement en production
  console.log(
    `🔐 [CSRF Production] Token généré: ${csrfToken.substring(0, 10)}... pour ${
      req.headers.origin || "client inconnu"
    }`
  );

  res.json({
    csrfToken,
  });
});

/**
 * @route GET /api/csrf/debug
 * @desc Route de debug pour afficher les cookies
 * @access Public
 */
router.get("/csrf/debug", (req, res) => {
  res.json({
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
module.exports.handle = handleCsrfToken;
