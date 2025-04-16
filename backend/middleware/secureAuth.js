const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

/**
 * Middleware d'authentification sécurisé
 * Vérifie le token JWT d'accès stocké dans un cookie httpOnly ou headers
 */
const secureAuth = async (req, res, next) => {
  try {
    console.log("Middleware d'authentification appelé pour", req.path);

    // Mode de développement simplifié pour les tests (à n'utiliser qu'en DEV)
    if (
      process.env.NODE_ENV !== "production" &&
      req.headers["x-dev-bypass-auth"]
    ) {
      console.log("⚠️ Mode développement: Authentification bypass activée");

      // Récupérer l'ID utilisateur du header de dev ou utiliser un ID par défaut
      const devUserId = req.headers["x-dev-user-id"] || "1";
      console.log("🔧 Utilisation de l'ID utilisateur de test:", devUserId);

      // Récupérer les informations de l'utilisateur
      try {
        const user = await User.findById(devUserId);

        if (user) {
          console.log("✅ Utilisateur de test trouvé:", user.email);

          const safeUser = {
            id: user.id,
            email: user.email,
            role: user.role || "admin",
            first_name: user.first_name,
            last_name: user.last_name,
            fullName:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Administrateur",
            profileImage: user.profileImage || null,
            company: user.company || "",
            phone: user.phone || "",
            jobTitle: user.jobTitle || "",
          };

          req.user = safeUser;
          req.userId = user.id;

          return next();
        } else {
          console.warn(
            "⚠️ Utilisateur de test non trouvé en mode développement"
          );
        }
      } catch (devError) {
        console.error(
          "Erreur lors de la recherche de l'utilisateur de test:",
          devError
        );
      }
    }

    // Récupérer le token depuis différentes sources (par ordre de priorité)
    const extractedToken = extractToken(req);

    if (!extractedToken.token) {
      console.log("Aucun token trouvé dans les cookies, headers ou body");
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
      });
    }

    console.log(
      `Token trouvé (source: ${extractedToken.source}). Longueur: ${extractedToken.token.length}`
    );

    // Vérifier et décoder le token
    console.log("Tentative de vérification du token...");
    const decoded = verifyAccessToken(extractedToken.token);

    if (!decoded) {
      console.log("Token invalide ou expiré (null)");
      return res.status(401).json({
        success: false,
        message: "Session invalide ou expirée",
        code: "INVALID_TOKEN",
      });
    }

    console.log("Token décodé avec succès. User ID:", decoded.userId);

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log(
        "Utilisateur non trouvé en base de données. ID:",
        decoded.userId
      );
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    console.log("Utilisateur trouvé:", user.email);

    // Vérifier si le compte est actif (explicitement désactivé)
    if (user.isActive === false) {
      console.log("Compte utilisateur désactivé:", user.email);
      return res.status(403).json({
        success: false,
        message: "Votre compte a été désactivé",
        code: "ACCOUNT_DISABLED",
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
      profileImage: user.profileImage || null,
      company: user.company || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
      isActive: user.isActive !== undefined ? user.isActive : true,
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
 * Extrait le token d'authentification de différentes sources
 * @param {Object} req - Requête Express
 * @returns {Object} - Token extrait et sa source
 */
function extractToken(req) {
  // 1. Cookie httpOnly (priorité la plus élevée - le plus sécurisé)
  if (req.cookies?.accessToken) {
    return {
      token: req.cookies.accessToken,
      source: "cookie-httpOnly",
    };
  }

  // 2. Cookie auth_token (non-httpOnly)
  if (req.cookies?.auth_token) {
    return {
      token: req.cookies.auth_token,
      source: "cookie-auth_token",
    };
  }

  // 3. Header Authorization
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      return {
        token: authHeader.substring(7),
        source: "header-authorization",
      };
    }
  }

  // 4. Body de la requête (priorité la plus basse)
  if (req.body?.token || req.body?.accessToken) {
    return {
      token: req.body.token || req.body.accessToken,
      source: "body-token",
    };
  }

  // Log tous les cookies disponibles pour débogage
  console.log("Cookies disponibles dans la requête:", req.cookies);
  console.log(
    "Headers Authorization:",
    req.headers.authorization || "non défini"
  );

  // Aucun token trouvé
  return { token: null, source: null };
}

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
