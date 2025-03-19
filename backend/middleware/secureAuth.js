const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

/**
 * Middleware d'authentification sécurisé
 * Vérifie le token JWT d'accès stocké dans un cookie httpOnly
 */
const secureAuth = async (req, res, next) => {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Session invalide ou expirée",
        code: "INVALID_TOKEN",
      });
    }

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    // Ajouter les informations de l'utilisateur à la requête sans exposer de données sensibles
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role || "admin",
      first_name: user.first_name,
      last_name: user.last_name,
      fullName:
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        "Administrateur",
    };

    req.user = safeUser;
    req.userId = user.id;
    req.tokenInfo = {
      jti: decoded.jti,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    // Continuer avec la requête
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error.message);

    // Journalisation sécurisée de l'erreur
    const logInfo = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
      errorType: error.name,
      errorMessage: error.message,
    };

    console.error("Auth failure details:", JSON.stringify(logInfo));

    // Réponse appropriée selon le type d'erreur
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expirée, veuillez vous reconnecter",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentification invalide",
      code: "AUTH_FAILED",
    });
  }
};

/**
 * Middleware de vérification des rôles
 * @param {Array<string>} roles - Liste des rôles autorisés
 */
const checkRole = (roles = ["admin"]) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
      });
    }

    // Vérifier si l'utilisateur a l'un des rôles requis
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Journaliser la tentative d'accès non autorisé
    console.warn("Tentative d'accès non autorisé:", {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: roles,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // Renvoyer une erreur 403 si l'utilisateur n'a pas les rôles requis
    return res.status(403).json({
      success: false,
      message: "Accès refusé: autorisation insuffisante",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  };
};

module.exports = {
  secureAuth,
  checkRole,
};
