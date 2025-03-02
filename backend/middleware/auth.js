const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Clé secrète pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";

// Middleware pour vérifier le token JWT
const auth = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Trouver l'utilisateur correspondant
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Définir le rôle de l'utilisateur comme admin
    user.role = "admin";

    // Ajouter l'utilisateur à l'objet req pour une utilisation ultérieure
    req.user = user;

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide." });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré." });
    }

    res
      .status(500)
      .json({ message: "Erreur du serveur lors de l'authentification." });
  }
};

// Middleware pour vérifier les rôles (maintenant tous les utilisateurs sont admin)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    // Tous les utilisateurs ont accès à toutes les fonctionnalités
    next();
  };
};

// Fonction pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "24h" } // Le token expire après 24 heures
  );
};

module.exports = {
  auth,
  checkRole,
  generateToken,
  JWT_SECRET,
};
