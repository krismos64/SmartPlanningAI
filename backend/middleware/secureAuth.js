const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

/**
 * Middleware d'authentification sécurisé
 * Vérifie le token JWT d'accès stocké dans un cookie httpOnly
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

    // Récupérer le token depuis les cookies ou depuis le header Authorization
    let token = req.cookies?.accessToken;
    let tokenSource = "cookie-httpOnly";

    // Si pas de token dans les cookies sécurisés, essayer le cookie non-httpOnly
    if (!token && req.cookies?.auth_token) {
      token = req.cookies.auth_token;
      tokenSource = "cookie-auth_token";
      console.log("Token trouvé dans cookie auth_token non-httpOnly");
    }

    // Si pas de token dans les cookies, essayer dans les headers
    if (!token && req.headers.authorization) {
      console.log("En-tête Authorization: Présent");
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        tokenSource = "header-authorization";
        console.log(
          "Token extrait du header:",
          token ? token.substring(0, 10) + "..." : "undefined..."
        );
      }
    }

    // Enfin, vérifier le body s'il s'agit d'une application frontend
    if (!token && req.body?.token) {
      token = req.body.token;
      tokenSource = "body-token";
      console.log("Token extrait du body de la requête");
    }

    if (!token) {
      console.log("Aucun token trouvé dans les cookies, headers, ou body");
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
      });
    }

    console.log(
      `Token trouvé (source: ${tokenSource}). Longueur: ${token.length}`
    );

    // Vérifier et décoder le token
    console.log("Tentative de vérification du token...");
    try {
      const decoded = verifyAccessToken(token);

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
      };

      console.log("Propriétés utilisateur disponibles:", Object.keys(safeUser));

      req.user = safeUser;
      req.userId = user.id;
      req.tokenInfo = {
        jti: decoded.jti,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      // Continuer avec la requête
      next();
    } catch (tokenError) {
      console.error(
        "Erreur lors de la vérification du token:",
        tokenError.message
      );

      return res.status(401).json({
        success: false,
        message: "Token invalide: " + tokenError.message,
        code: "INVALID_TOKEN",
      });
    }
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
