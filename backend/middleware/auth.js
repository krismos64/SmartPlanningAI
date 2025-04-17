const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");
const logger = require("../utils/logger");
const { ACCESS_TOKEN_SECRET } = require("../utils/tokenUtils");

/**
 * Middleware pour vérifier le token d'accès JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const verifyToken = async (req, res, next) => {
  try {
    logger.debug("Vérification du token d'authentification", {
      path: req.path,
      method: req.method,
    });

    // Récupérer le token depuis les cookies ou l'en-tête
    let token = req.cookies.accessToken;

    // Si pas de token dans les cookies, vérifier l'en-tête Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      // Format attendu: "Bearer [token]"
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("🔑 [AUTH] Token récupéré depuis l'en-tête Authorization");
      }
    }

    // Vérifier si le token existe
    if (!token) {
      // Journaliser la tentative d'authentification échouée
      logAuthAttempt(req, null, false, "Token manquant");

      logger.debug("Authentification refusée: token manquant", {
        path: req.path,
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Accès refusé - Token d'authentification manquant",
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log(
      `✅ [AUTH] Token vérifié avec succès pour userID: ${decoded.userId}`
    );

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);

    if (!user) {
      // Journaliser la tentative d'authentification échouée
      logAuthAttempt(req, decoded.userId, false, "Utilisateur non trouvé");

      logger.warn("Authentification refusée: utilisateur non trouvé", {
        userId: decoded.userId,
        path: req.path,
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Si l'utilisateur est désactivé
    if (user.isActive === false) {
      // Journaliser la tentative d'authentification échouée
      logAuthAttempt(req, user._id, false, "Compte désactivé");

      logger.warn("Authentification refusée: compte désactivé", {
        userId: user._id,
        email: user.email,
        path: req.path,
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: "Votre compte a été désactivé",
      });
    }

    // Ajouter l'utilisateur et l'ID à la requête
    req.user = user;
    req.userId = decoded.userId;

    // Définir ou mettre à jour l'utilisateur dans la session
    if (req.session && !req.session.user) {
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role || "admin",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "Utilisateur",
      };
      console.log(`✅ [AUTH] Session utilisateur créée pour: ${user.email}`);
    }

    // Journaliser la tentative d'authentification réussie
    logAuthAttempt(req, user._id, true);

    logger.debug("Authentification réussie", {
      userId: user._id,
      email: user.email,
      role: user.role,
      path: req.path,
    });

    next();
  } catch (error) {
    // Journaliser l'erreur
    logAuthAttempt(req, null, false, error.message);

    logger.error("Erreur lors de la vérification du token", {
      error: error.message,
      path: req.path,
      ipAddress: req.ip,
      stack: error.stack,
    });

    // Gérer les erreurs spécifiques de JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Le token d'authentification a expiré",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification invalide",
      });
    }

    // Erreur générique
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'authentification",
    });
  }
};

/**
 * Journalise une tentative d'authentification
 * @param {Object} req - Requête Express
 * @param {String} userId - ID de l'utilisateur (si disponible)
 * @param {Boolean} success - Si l'authentification a réussi
 * @param {String} reason - Raison de l'échec (si applicable)
 */
const logAuthAttempt = (req, userId, success, reason = null) => {
  const level = success ? "INFO" : "WARN";
  const message = success
    ? "Authentification réussie"
    : `Authentification échouée: ${reason}`;

  const details = {
    userId: userId || "anonyme",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    success,
  };

  // Si échec, ajouter la raison
  if (!success && reason) {
    details.reason = reason;
  }

  // Utiliser la fonction de journalisation d'authentification
  logger.auth(level, message, details);
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  logger.warn("Accès admin refusé", {
    userId: req.userId,
    path: req.path,
    ipAddress: req.ip,
  });

  return res.status(403).json({
    success: false,
    message: "Accès refusé - Droits d'administrateur requis",
  });
};

/**
 * Middleware pour vérifier si l'utilisateur est employé
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const isEmployee = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "employee")) {
    return next();
  }

  logger.warn("Accès employé refusé", {
    userId: req.userId,
    path: req.path,
    ipAddress: req.ip,
  });

  return res.status(403).json({
    success: false,
    message: "Accès refusé - Droits d'employé requis",
  });
};

module.exports = {
  verifyToken,
  isAdmin,
  isEmployee,
};
