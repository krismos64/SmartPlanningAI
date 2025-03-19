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
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    signed: true,
  },
});

/**
 * Génère un token CSRF pour le client
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const generateCsrfToken = (req, res, next) => {
  // Vérifier si un token CSRF est déjà disponible
  if (!req.csrfToken) {
    console.error("Le middleware csrf n'est pas configuré correctement");
    return res.status(500).json({
      success: false,
      message: "Erreur de configuration de sécurité CSRF",
    });
  }

  // Générer le token CSRF
  const token = req.csrfToken();

  // Ajouter le token à la réponse pour le client
  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false, // Accessible via JavaScript (nécessaire pour les apps client-side)
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // Stocker le token dans l'objet req pour un accès facile
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
