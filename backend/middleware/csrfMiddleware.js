const csrf = require("csurf");
const crypto = require("crypto");

/**
 * Middleware de protection CSRF
 * Utilise des cookies sécurisés pour stocker les tokens CSRF
 */
const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    httpOnly: true,
    secure: true,
    sameSite: "None",
    signed: true,
    path: "/",
    domain: ".smartplanning.fr",
  },
});

/**
 * Génère un token CSRF pour le client
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const generateCsrfToken = (req, res, next) => {
  if (!req.csrfToken) {
    console.error("Le middleware csrf n'est pas configuré correctement");
    return res.status(500).json({
      success: false,
      message: "Erreur de configuration de sécurité CSRF",
    });
  }

  const token = req.csrfToken();

  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: ".smartplanning.fr",
  });

  req.csrfToken = token;
  next();
};

/**
 * Handler d'erreur CSRF personnalisé
 * @param {Object} err - Erreur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") {
    return next(err);
  }

  // Journaliser la tentative potentielle d'attaque CSRF
  console.error("Tentative CSRF détectée:", {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });

  // Envoyer une réponse d'erreur
  res.status(403).json({
    success: false,
    message: "Action rejetée: tentative d'attaque CSRF détectée",
  });
};

module.exports = {
  csrfProtection,
  generateCsrfToken,
  handleCsrfError,
};
