const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");

// Configuration
const ACCESS_TOKEN_SECRET =
  config.jwtAccessSecret ||
  process.env.JWT_SECRET ||
  "smartplanning_secret_key";
const REFRESH_TOKEN_SECRET =
  config.jwtRefreshSecret ||
  process.env.JWT_REFRESH_SECRET ||
  "smartplanning_refresh_secret_key";
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 jours

/**
 * Génère une chaîne aléatoire cryptographiquement sécurisée
 * @param {number} length - Longueur de la chaîne à générer
 * @returns {string} - Chaîne aléatoire
 */
function generateSecureRandomString(length = 64) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

/**
 * Génère un token d'accès et un refresh token pour un utilisateur
 * @param {number|string} userId - ID de l'utilisateur
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Object} - Tokens générés et leur date d'expiration
 */
function generateTokens(userId, role = "admin") {
  // Obtenir la date actuelle en secondes
  const now = Math.floor(Date.now() / 1000);

  console.log(
    "Génération de tokens pour l'utilisateur:",
    userId,
    "role:",
    role
  );

  // Vérifier que userId est bien défini
  if (!userId) {
    console.error("ERREUR: Tentative de générer un token sans userId");
    throw new Error("userId est requis pour générer un token");
  }

  // Générer un identifiant unique pour le token (jti)
  const tokenId = crypto.randomBytes(16).toString("hex");

  // Assurer que userId est une chaîne
  const userIdStr = String(userId);

  // Générer le token d'accès avec des claims de sécurité
  const accessToken = jwt.sign(
    {
      userId: userIdStr,
      role,
      iat: now, // Issued at (date d'émission)
      nbf: now, // Not before (pas valide avant)
      jti: tokenId, // JWT ID (identifiant unique)
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Calculer la date d'expiration du token d'accès
  const accessExpires = new Date(now * 1000 + 60 * 60 * 1000); // +1 heure

  // Générer le refresh token avec l'ID du token d'accès
  const refreshToken = jwt.sign(
    {
      userId,
      tokenId, // Lier le refresh token au token d'accès
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Calculer la date d'expiration du refresh token
  const refreshExpires = new Date(now * 1000 + 7 * 24 * 60 * 60 * 1000); // +7 jours

  return {
    accessToken,
    refreshToken,
    accessExpires,
    refreshExpires,
  };
}

/**
 * Vérifie un token d'accès JWT
 * @param {string} token - Le token JWT à vérifier
 * @returns {object|null} - Le contenu décodé du token ou null si invalide
 */
const verifyAccessToken = (token) => {
  if (!token) {
    console.error("Tentative de vérification d'un token null ou undefined");
    return null;
  }

  try {
    console.log(`Vérification du token (${token.substring(0, 15)}...)`);

    // Vérification du token avec la clé secrète
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Validation basique du contenu du token
    if (!decoded.userId) {
      console.error("Token malformé: userId manquant dans le token décodé");
      return null;
    }

    // Log de succès avec informations importantes
    console.log(
      `✅ Token valide pour l'utilisateur ${decoded.userId} (expire: ${new Date(
        decoded.exp * 1000
      ).toISOString()})`
    );

    return decoded;
  } catch (error) {
    // Gestion spécifique selon le type d'erreur
    if (error.name === "TokenExpiredError") {
      console.error(`Token expiré: ${error.expiredAt}`);
    } else if (error.name === "JsonWebTokenError") {
      console.error(`Erreur de vérification JWT: ${error.message}`);
    } else {
      console.error(
        `Erreur inattendue lors de la vérification du token: ${error.name} - ${error.message}`
      );
    }

    return null;
  }
};

/**
 * Vérifie un refresh token JWT
 * @param {string} token - Le refresh token JWT à vérifier
 * @returns {object|null} - Le contenu décodé du token ou null si invalide
 */
const verifyRefreshToken = (token) => {
  if (!token) {
    console.error(
      "Tentative de vérification d'un refresh token null ou undefined"
    );
    return null;
  }

  try {
    console.log(`Vérification du refresh token (${token.substring(0, 15)}...)`);

    // Vérification du token avec la clé secrète
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    // Validation basique du contenu du token
    if (!decoded.userId) {
      console.error(
        "Refresh token malformé: userId manquant dans le token décodé"
      );
      return null;
    }

    // Log de succès avec informations importantes
    console.log(
      `✅ Refresh token valide pour l'utilisateur ${
        decoded.userId
      } (expire: ${new Date(decoded.exp * 1000).toISOString()})`
    );

    return decoded;
  } catch (error) {
    // Gestion spécifique selon le type d'erreur
    if (error.name === "TokenExpiredError") {
      console.error(`Refresh token expiré: ${error.expiredAt}`);
    } else if (error.name === "JsonWebTokenError") {
      console.error(`Erreur de vérification JWT refresh: ${error.message}`);
    } else {
      console.error(
        `Erreur inattendue lors de la vérification du refresh token: ${error.name} - ${error.message}`
      );
    }

    return null;
  }
};

/**
 * Définit les cookies sécurisés pour les tokens JWT
 * @param {Object} res - Objet response Express
 * @param {string} accessToken - Token d'accès
 * @param {string} refreshToken - Refresh token
 * @param {Date} accessExpires - Date d'expiration du token d'accès
 * @param {Date} refreshExpires - Date d'expiration du refresh token
 */
function setTokenCookies(
  res,
  { accessToken, refreshToken, accessExpires, refreshExpires }
) {
  // Configuration différente selon l'environnement
  const isProduction = process.env.NODE_ENV === "production";

  // Configuration commune pour tous les cookies
  const cookieConfig = {
    httpOnly: true,
    secure: isProduction, // Cookies sécurisés uniquement en production
    sameSite: isProduction ? "None" : "Lax", // Cross-domain en production, Lax en développement
    path: "/",
  };

  console.log("🍪 Configuration des cookies de token JWT");
  console.log(
    "- accessToken (premiers caractères):",
    accessToken.substring(0, 10)
  );
  console.log("- accessExpires:", accessExpires);
  console.log("- refreshExpires:", refreshExpires);
  console.log("- cookieConfig:", JSON.stringify(cookieConfig));
  console.log("- Environment:", process.env.NODE_ENV);

  // Configurer le cookie pour le token d'accès
  res.cookie("accessToken", accessToken, {
    ...cookieConfig,
    expires: accessExpires,
  });
  console.log("✅ Cookie accessToken défini, expire:", accessExpires);

  // Configurer le cookie pour le refresh token - s'assurer qu'il est accessible pour /api/auth/refresh
  res.cookie("refreshToken", refreshToken, {
    ...cookieConfig,
    // Assurer que le cookie est accessible à la route de rafraîchissement
    path: "/",
    expires: refreshExpires,
  });
  console.log("✅ Cookie refreshToken défini, expire:", refreshExpires);

  // Cookie non-httpOnly pour le client JavaScript
  res.cookie("auth_token", accessToken, {
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    httpOnly: false,
    expires: accessExpires,
  });
  console.log(
    "✅ Cookie auth_token défini (non-httpOnly) pour accès JavaScript"
  );

  // Définir un en-tête Authorization pour les clients qui ne supportent pas les cookies
  res.setHeader("Authorization", `Bearer ${accessToken}`);
  console.log("✅ En-tête Authorization défini avec le token JWT");

  // Ajout des tokens dans le corps de la réponse pour que le frontend puisse les récupérer
  // même si les cookies ne sont pas correctement stockés
  if (!res.locals.tokenAdded) {
    res._json = res.json;
    res.json = function (body) {
      body = body || {};
      // Ne pas écraser token et refreshToken s'ils existent déjà
      if (!body.token && !body.accessToken) {
        body.accessToken = accessToken;
        body.token = accessToken; // Pour la compatibilité
      }
      if (!body.refreshToken) {
        body.refreshToken = refreshToken;
      }
      res.locals.tokenAdded = true;
      return res._json(body);
    };
    console.log("✅ Tokens ajoutés au corps de la réponse JSON (fallback)");
  }

  return accessToken;
}

/**
 * Efface les cookies de tokens
 * @param {Object} res - Objet response Express
 */
function clearTokenCookies(res) {
  // Déterminer l'environnement
  const isProduction = process.env.NODE_ENV === "production";

  // Configuration des cookies commune
  const cookieConfig = {
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    httpOnly: true,
    path: "/",
  };

  // Effacer les cookies JWT
  res.cookie("accessToken", "", {
    ...cookieConfig,
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    ...cookieConfig,
    expires: new Date(0),
  });

  // Effacer également le cookie non-httpOnly
  res.cookie("auth_token", "", {
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    httpOnly: false,
    path: "/",
    expires: new Date(0),
  });
}

/**
 * Crée un refresh token JWT pour un utilisateur
 * @param {object} user - L'utilisateur pour lequel créer le token
 * @returns {string} - Le refresh token généré
 */
const createRefreshToken = (user) => {
  if (!user || !user._id) {
    console.error(
      "Tentative de création d'un refresh token avec un utilisateur invalide"
    );
    throw new Error(
      "Données utilisateur invalides pour la création du refresh token"
    );
  }

  try {
    const payload = {
      userId: user._id,
      role: user.role || "user",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
    };

    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET);

    console.log(
      `✅ Refresh token créé pour l'utilisateur ${user._id} (expire dans ${
        REFRESH_TOKEN_EXPIRY / 86400
      } jours)`
    );

    return token;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création du refresh token: ${error.message}`
    );
    throw new Error(`Échec de la création du refresh token: ${error.message}`);
  }
};

/**
 * Crée un access token JWT pour un utilisateur
 * @param {object} user - L'utilisateur pour lequel créer le token
 * @returns {string} - L'access token généré
 */
const createAccessToken = (user) => {
  if (!user || !user._id) {
    console.error(
      "Tentative de création d'un access token avec un utilisateur invalide"
    );
    throw new Error(
      "Données utilisateur invalides pour la création de l'access token"
    );
  }

  try {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role || "user",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    };

    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET);

    console.log(
      `✅ Access token créé pour l'utilisateur ${user._id} (expire dans ${
        ACCESS_TOKEN_EXPIRY / 60
      } minutes)`
    );

    return token;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création de l'access token: ${error.message}`
    );
    throw new Error(`Échec de la création de l'access token: ${error.message}`);
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  createRefreshToken,
  createAccessToken,
};
