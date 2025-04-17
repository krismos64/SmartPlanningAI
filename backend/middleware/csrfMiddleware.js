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
  // Logs détaillés activés uniquement en mode debug explicite
  if (process.env.CSRF_DEBUG === "true") {
    console.log(`[CSRF DEBUG] ${req.method} ${req.originalUrl}`);

    // En-têtes pertinents pour le CSRF
    const relevantHeaders = [
      "x-csrf-token",
      "csrf-token",
      "xsrf-token",
      "x-xsrf-token",
    ];

    const headers = {};
    relevantHeaders.forEach((header) => {
      if (req.headers[header]) {
        headers[header] = req.headers[header];
      }
    });

    if (Object.keys(headers).length > 0) {
      console.log("CSRF Headers:", headers);
    }
  }
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
      // Log uniquement en mode développement
      if (
        process.env.NODE_ENV === "development" &&
        process.env.CSRF_DEBUG === "true"
      ) {
        console.log("CSRF token généré");
      }
    } else {
      // Conserver uniquement les logs d'erreur critiques
      console.error("Session non disponible pour stocker le token CSRF");
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

  // Log détaillé pour faciliter le debugging
  console.log(
    "🛡️ [CSRF] Token reçu :",
    req.headers["x-csrf-token"] || "Non défini"
  );
  console.log(
    "🔐 [CSRF] Token attendu :",
    req.session?.csrfToken || "Non défini"
  );

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
    console.error("❌ [CSRF] Token manquant dans l'en-tête");
    return res.status(403).json({
      success: false,
      message: "Accès refusé - Token CSRF manquant",
      error: "CSRF_TOKEN_MISSING",
    });
  }

  // Si aucun token n'est stocké dans la session
  if (!storedToken) {
    console.error("❌ [CSRF] Token non trouvé en session");
    return res.status(403).json({
      success: false,
      message: "Accès refusé - Session invalide ou expirée",
      error: "CSRF_SESSION_INVALID",
    });
  }

  // Comparaison des tokens (sensible à la casse)
  if (csrfToken !== storedToken) {
    console.error(
      "❌ [CSRF] Token invalide - ne correspond pas à celui en session"
    );
    return res.status(403).json({
      success: false,
      message: "Accès refusé - Token CSRF invalide",
      error: "CSRF_TOKEN_INVALID",
    });
  }

  // Token valide
  console.log("✅ [CSRF] Vérification du token réussie");
  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
  logRequestDetails,
  // Alias pour assurer la compatibilité avec les nouveaux appels
  generateCSRFToken: generateCsrfToken,
};
