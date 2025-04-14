const express = require("express");
const router = express.Router();
const { generateCSRFToken } = require("../middleware/csrfMiddleware");

/**
 * @route   GET /api/csrf-token
 * @desc    Génère et retourne un token CSRF
 * @access  Public
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

module.exports = router;
