const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";

/**
 * Middleware d'authentification
 * Vérifie si l'utilisateur est authentifié via un token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token d'autorisation
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      console.log("Authorization header missing");
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    // Vérifier le format du token (Bearer token)
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("Invalid authorization format");
      return res.status(401).json({
        success: false,
        message: "Format d'authentification invalide",
      });
    }

    const token = parts[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Récupérer les informations de l'utilisateur
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      decoded.userId || decoded.id,
    ]);

    if (users.length === 0) {
      console.log("User not found");
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    const user = users[0];
    delete user.password; // Ne pas inclure le mot de passe

    req.user = user;
    req.userId = user.id;

    // Continuer avec la requête
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentification invalide",
    });
  }
};

module.exports = { authMiddleware };
