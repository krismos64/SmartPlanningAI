const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Configuration
const ACCESS_TOKEN_SECRET =
  process.env.JWT_SECRET || "smartplanning_secret_key";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "smartplanning_refresh_secret_key";
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
 * @param {string} token - Token à vérifier
 * @returns {Object|null} - Données décodées du token ou null si invalide
 */
function verifyAccessToken(token) {
  try {
    console.log(
      `Vérification du token (longueur: ${token.length}): ${token.substring(
        0,
        10
      )}...`
    );

    // Une petite sécurité pour traiter différents formats possibles de token
    let cleanToken = token;
    if (token.startsWith("Bearer ")) {
      cleanToken = token.substring(7);
      console.log("Token corrigé - format Bearer détecté");
    }

    // Quelques informations sur le token
    try {
      const parts = cleanToken.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
        console.log("Token header:", header);

        // Debug du payload
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        console.log("Token payload:", payload);

        // Vérifier si userId est présent dans le payload - BLOCAGE si absent
        if (!payload.userId) {
          console.error(
            "ERREUR CRITIQUE: Le payload du token ne contient pas d'userId!"
          );
          throw new Error("Token invalide: userId manquant dans le payload");
        }
      } else {
        console.log("Format de token invalide (pas 3 parties)");
      }
    } catch (e) {
      console.log("Impossible de décoder l'en-tête du token:", e.message);
      // Remonter l'erreur pour faire échouer la vérification du token
      if (e.message.includes("userId manquant")) {
        throw e;
      }
    }

    const decoded = jwt.verify(cleanToken, ACCESS_TOKEN_SECRET);
    console.log("Token décodé avec succès:", {
      userId: decoded.userId,
      role: decoded.role,
      exp: decoded.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : "non défini",
      iat: decoded.iat
        ? new Date(decoded.iat * 1000).toISOString()
        : "non défini",
    });

    // Vérification supplémentaire que userId est bien présent
    if (!decoded.userId) {
      console.error("ERREUR: Le token ne contient pas d'ID utilisateur");
    }

    return decoded;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du token d'accès:",
      error.message
    );
    // Ajouter plus d'informations de débogage
    console.error("Type d'erreur:", error.name);

    if (error.name === "JsonWebTokenError") {
      console.error("Détails supplémentaires:", error.message);
    } else if (error.name === "TokenExpiredError") {
      console.error("Token expiré à:", new Date(error.expiredAt).toISOString());
    }

    return null;
  }
}

/**
 * Vérifie un refresh token JWT
 * @param {string} token - Refresh token à vérifier
 * @returns {Object|null} - Données décodées du token ou null si invalide
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    // Vérifier que c'est bien un refresh token
    if (decoded.type !== "refresh") {
      console.error("Type de token invalide:", decoded.type);
      return null;
    }
    return decoded;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du refresh token:",
      error.message
    );
    return null;
  }
}

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
  // Configuration commune pour tous les cookies
  const cookieConfig = {
    httpOnly: true,
    secure: true, // Cookies sécurisés
    sameSite: "None", // Important pour le cross-domain
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

  // Configurer le cookie pour le token d'accès
  res.cookie("accessToken", accessToken, {
    ...cookieConfig,
    expires: accessExpires,
  });
  console.log("✅ Cookie accessToken défini, expire:", accessExpires);

  // Configurer le cookie pour le refresh token
  res.cookie("refreshToken", refreshToken, {
    ...cookieConfig,
    expires: refreshExpires,
  });
  console.log("✅ Cookie refreshToken défini, expire:", refreshExpires);

  // Cookie non-httpOnly pour le client JavaScript
  res.cookie("auth_token", accessToken, {
    secure: true,
    sameSite: "None",
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
  // Configuration des cookies commune
  const cookieConfig = {
    secure: true,
    sameSite: "None",
    httpOnly: true,
    domain: "smartplanning.onrender.com",
  };

  // Effacer les cookies JWT
  res.cookie("accessToken", "", {
    ...cookieConfig,
    expires: new Date(0),
    path: "/",
  });

  res.cookie("refreshToken", "", {
    ...cookieConfig,
    expires: new Date(0),
    path: "/",
  });
}

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
