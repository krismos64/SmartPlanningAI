const express = require("express");
const router = express.Router();
const crypto = require("crypto");

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
router.get("/token", handleCsrfToken);

/**
 * @route GET /api/csrf/debug
 * @desc Route de debug pour afficher les cookies
 * @access Public
 */
router.get("/debug", (req, res) => {
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
