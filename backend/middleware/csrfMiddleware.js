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
    domain: "smartplanning.onrender.com",
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
 * Affiche les détails complets d'une requête pour le debugging
 * @param {Object} req - Objet de requête Express
 */
const logRequestDetails = (req) => {
  console.log("\n📝 [CSRF DEBUG] Détails de la requête:");
  console.log(`📍 URL: ${req.method} ${req.originalUrl}`);
  console.log("🔑 En-têtes:");

  // En-têtes pertinents pour le CSRF
  const relevantHeaders = [
    "x-csrf-token",
    "csrf-token",
    "xsrf-token",
    "x-xsrf-token",
    "cookie",
    "origin",
    "referer",
  ];

  relevantHeaders.forEach((header) => {
    if (req.headers[header]) {
      console.log(`  ${header}: ${req.headers[header]}`);
    }
  });

  console.log("🍪 Cookies:", req.cookies);

  // Session si disponible
  if (req.session) {
    console.log(
      "🔐 Session CSRF Token:",
      req.session.csrfToken
        ? `${req.session.csrfToken.substring(0, 10)}...`
        : "Non défini"
    );
  }

  // Corps de la requête (pour debugging - attention aux données sensibles!)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Masquer les données sensibles
    if (sanitizedBody.password) sanitizedBody.password = "******";
    if (sanitizedBody.token) sanitizedBody.token = "******";
    console.log("📦 Corps:", sanitizedBody);
  }

  console.log("");
};

/**
 * Middleware de vérification du token CSRF
 */
const verifyCsrfToken = (req, res, next) => {
  // Ne pas vérifier pour les méthodes GET, OPTIONS, HEAD
  if (["GET", "OPTIONS", "HEAD"].includes(req.method)) {
    return next();
  }

  // Log détaillé pour debugging
  logRequestDetails(req);

  // Récupérer le token depuis les différents en-têtes possibles
  const csrfToken =
    req.headers["x-csrf-token"] ||
    req.headers["csrf-token"] ||
    req.headers["xsrf-token"] ||
    req.headers["x-xsrf-token"];

  // Récupérer le token stocké (en priorité dans la session, sinon dans les cookies)
  const storedToken = req.session?.csrfToken || req.cookies["XSRF-TOKEN"];

  // Si aucun token n'est fourni dans l'en-tête
  if (!csrfToken) {
    console.error("⛔ [CSRF] Token manquant dans les en-têtes");
    console.error("Cookies disponibles:", req.cookies);
    console.error("Session disponible:", req.session ? "Oui" : "Non");
    console.error("En-têtes de la requête:", req.headers);

    // En mode DEBUG, on peut temporairement désactiver la vérification
    if (
      process.env.CSRF_DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.warn("⚠️ [CSRF] Vérification CSRF ignorée en mode DEBUG");
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé - Token CSRF manquant",
      error: "CSRF_TOKEN_MISSING",
    });
  }

  // Si aucun token n'est stocké dans la session ou dans les cookies
  if (!storedToken) {
    console.error("⛔ [CSRF] Token non trouvé dans la session ou les cookies");
    console.error("Token reçu:", csrfToken);
    console.error("Cookies:", req.cookies);

    // En mode DEBUG, on peut temporairement désactiver la vérification
    if (
      process.env.CSRF_DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.warn("⚠️ [CSRF] Vérification CSRF ignorée en mode DEBUG");
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé - Session invalide ou expirée",
      error: "CSRF_SESSION_INVALID",
    });
  }

  // Comparaison des tokens (sensible à la casse)
  if (csrfToken !== storedToken) {
    console.error("⛔ [CSRF] Token invalide");
    console.error(`  Reçu: ${csrfToken}`);
    console.error(`  Attendu: ${storedToken}`);

    // En mode DEBUG, on peut temporairement désactiver la vérification
    if (
      process.env.CSRF_DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "⚠️ [CSRF] Vérification CSRF ignorée en mode DEBUG - tokens ne correspondent pas"
      );
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé - Token CSRF invalide",
      error: "CSRF_TOKEN_INVALID",
    });
  }

  // Token valide, continuer
  console.log("✅ [CSRF] Validation réussie");
  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
  logRequestDetails,
};
