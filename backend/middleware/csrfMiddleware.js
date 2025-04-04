const crypto = require("crypto");

// Configuration
const CSRF_CONFIG = {
  secretLength: 32, // 256 bits
  tokenExpiration: 24 * 60 * 60 * 1000, // 24h
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
 * Génère un nouveau token CSRF et le stocke dans la session
 */
const generateCsrfToken = (req, res, next) => {
  try {
    // Générer un token aléatoire
    const csrfToken = crypto
      .randomBytes(CSRF_CONFIG.secretLength)
      .toString("hex");

    // Stocker le token dans la session
    if (req.session) {
      req.session.csrfToken = csrfToken;
      console.log(
        "✅ [CSRF] Token stocké dans la session:",
        csrfToken.substring(0, 10) + "..."
      );
    } else {
      console.error(
        "❌ [CSRF] Session non disponible pour stocker le token CSRF"
      );
    }

    // Exposer le token dans la réponse
    res.locals.csrfToken = csrfToken;
    next();
  } catch (error) {
    console.error("Erreur lors de la génération du token CSRF:", error);
    res.status(500).json({ error: "Erreur de sécurité" });
  }
};

/**
 * Middleware de vérification du token CSRF via l'en-tête X-CSRF-Token
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

  // Récupérer le token stocké dans la session
  const storedToken = req.session?.csrfToken;

  // Si aucun token n'est fourni dans l'en-tête
  if (!csrfToken) {
    console.error("⛔ [CSRF] Token manquant dans les en-têtes");
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

  // Si aucun token n'est stocké dans la session
  if (!storedToken) {
    console.error("⛔ [CSRF] Token non trouvé dans la session");
    console.error("Token reçu:", csrfToken);

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
