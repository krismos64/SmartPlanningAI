const crypto = require("crypto");

// Configuration
const CSRF_CONFIG = {
  secretLength: 32, // 256 bits
  tokenExpiration: 24 * 60 * 60 * 1000, // 24h
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: ".smartplanning.fr",
  },
};

/**
 * Génère et envoie un token CSRF sous forme de cookies
 */
const generateCsrfToken = (req, res, next) => {
  try {
    // Générer un secret aléatoire
    const secret = crypto.randomBytes(CSRF_CONFIG.secretLength).toString("hex");

    // Créer un token avec timestamp
    const timestamp = Date.now();
    const tokenData = `${timestamp}:${secret}`;
    const token = crypto
      .createHmac("sha256", secret)
      .update(tokenData)
      .digest("hex");

    // Stocker le secret dans un cookie HttpOnly
    res.cookie("_csrf_secret", secret, {
      ...CSRF_CONFIG.cookieOptions,
      maxAge: CSRF_CONFIG.tokenExpiration,
    });

    // Stocker le token public avec timestamp
    res.cookie("XSRF-TOKEN", `${timestamp}:${token}`, {
      ...CSRF_CONFIG.cookieOptions,
      httpOnly: false,
      maxAge: CSRF_CONFIG.tokenExpiration,
    });

    req.csrfToken = token;
    next();
  } catch (error) {
    console.error("Erreur lors de la génération du token CSRF:", error);
    res.status(500).json({ error: "Erreur de sécurité" });
  }
};

/**
 * Vérifie que le token CSRF reçu est valide
 */
const verifyCsrfToken = (req, res, next) => {
  try {
    const secret = req.cookies["_csrf_secret"];
    const token = req.get("x-xsrf-token") || req.body._csrf;

    if (!secret || !token) {
      return res.status(403).json({ error: "Token CSRF manquant" });
    }

    // Extraire le timestamp du token
    const [timestamp, receivedToken] = token.split(":");
    if (!timestamp || !receivedToken) {
      return res.status(403).json({ error: "Format de token invalide" });
    }

    // Vérifier l'expiration
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > CSRF_CONFIG.tokenExpiration) {
      return res.status(403).json({ error: "Token CSRF expiré" });
    }

    // Vérifier la signature
    const tokenData = `${timestamp}:${secret}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(tokenData)
      .digest("hex");

    if (receivedToken !== expected) {
      return res.status(403).json({ error: "Token CSRF invalide" });
    }

    // Vérifier l'origine de la requête
    const origin = req.get("origin");
    const referer = req.get("referer");
    if (origin && !origin.includes("smartplanning.fr")) {
      return res.status(403).json({ error: "Origine non autorisée" });
    }

    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token CSRF:", error);
    res.status(500).json({ error: "Erreur de sécurité" });
  }
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
};
