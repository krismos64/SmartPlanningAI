const csrf = require("csrf-csrf").default;
const tokens = csrf();

/**
 * Middleware de protection CSRF
 * Utilise des cookies sécurisés pour stocker les tokens CSRF
 */
const csrfMiddleware = (req, res, next) => {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);

  // Stocke le secret côté serveur dans un cookie HTTPOnly
  res.cookie("_csrf_secret", secret, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: ".smartplanning.fr",
  });

  // Stocke le token accessible par le frontend
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
  csrfMiddleware,
  handleCsrfError,
};
