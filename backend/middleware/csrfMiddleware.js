const crypto = require("crypto");

/**
 * Génère et envoie un token CSRF sous forme de cookies
 */
const generateCsrfToken = (req, res, next) => {
  const secret = crypto.randomBytes(24).toString("hex");
  const token = crypto.createHmac("sha256", secret).digest("hex");

  res.cookie("_csrf_secret", secret, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: ".smartplanning.fr",
  });

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
 * Vérifie que le token CSRF reçu est valide
 */
const verifyCsrfToken = (req, res, next) => {
  const secret = req.cookies["_csrf_secret"];
  const token = req.get("x-xsrf-token") || req.body._csrf;

  if (!secret || !token) {
    return res.status(403).json({ error: "Token CSRF manquant" });
  }

  const expected = crypto.createHmac("sha256", secret).digest("hex");
  if (token !== expected) {
    return res.status(403).json({ error: "Token CSRF invalide" });
  }

  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
};
