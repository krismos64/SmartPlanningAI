const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Configuration
const ACCESS_TOKEN_SECRET =
  process.env.JWT_SECRET || generateSecureRandomString(64);
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || generateSecureRandomString(64);
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 heure
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

  // Générer un identifiant unique pour le token (jti)
  const tokenId = crypto.randomBytes(16).toString("hex");

  // Générer le token d'accès avec des claims de sécurité
  const accessToken = jwt.sign(
    {
      userId,
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
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du token d'accès:",
      error.message
    );
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
  // Déterminer si on est en environnement de production
  const isProduction = process.env.NODE_ENV === "production";

  // Configurer le cookie pour le token d'accès
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Inaccessible via JavaScript
    secure: isProduction, // HTTPS uniquement en production
    sameSite: isProduction ? "strict" : "lax", // Protection CSRF
    expires: accessExpires,
  });

  // Configurer le cookie pour le refresh token avec un chemin spécifique
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/auth/refresh", // Restreindre à la route de refresh
    expires: refreshExpires,
  });
}

/**
 * Efface les cookies de tokens
 * @param {Object} res - Objet response Express
 */
function clearTokenCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
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
