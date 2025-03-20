const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyAccessToken } = require("../utils/tokenUtils");

// Clé secrète pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";

// Middleware pour vérifier le token JWT - adapté pour fonctionner avec secureAuth
const auth = async (req, res, next) => {
  try {
    console.log("Middleware d'authentification appelé pour", req.path);

    // Récupérer le token depuis les cookies ou depuis le header Authorization
    let token = req.cookies?.accessToken;

    // Si pas de token dans les cookies, essayer dans les headers
    if (!token && req.headers.authorization) {
      console.log("En-tête Authorization: Présent");
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log(
          "Token extrait du header:",
          token ? token.substring(0, 10) + "..." : "undefined..."
        );
      }
    }

    if (!token) {
      console.log("Aucun token trouvé");
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      console.log("Token invalide ou expiré");
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

    // Vérifier explicitement que l'ID utilisateur est défini
    if (!user.id) {
      console.error(
        "ERREUR CRITIQUE: L'ID utilisateur est manquant dans les données de l'utilisateur"
      );
      return res.status(401).json({
        success: false,
        message: "Erreur d'authentification: identifiant utilisateur manquant",
        code: "MISSING_USER_ID",
      });
    }

    // Debug logs
    console.log("=== AUTH MIDDLEWARE ===");
    console.log("Auth successful for user ID:", user.id);
    console.log("User info:", safeUser);
    console.log("User ID from token:", decoded.userId);
    console.log("User ID from database:", user.id);
    console.log("=====================");

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

// Middleware pour vérifier les rôles (maintenant tous les utilisateurs sont admin)
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

// Fonction pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" } // Le token expire après 7 jours
  );
};

module.exports = {
  auth,
  checkRole,
  generateToken,
  JWT_SECRET,
};
