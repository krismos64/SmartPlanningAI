const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Clé secrète pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";

// Middleware pour vérifier le token JWT
const auth = async (req, res, next) => {
  try {
    console.log("Middleware d'authentification appelé pour", req.path);

    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    console.log("En-tête Authorization:", authHeader ? "Présent" : "Absent");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token manquant ou format incorrect");
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    console.log(
      "Token extrait:",
      token ? token.substring(0, 10) + "..." : "Absent"
    );

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token décodé:", decoded);

    // Trouver l'utilisateur correspondant
    const user = await User.findById(decoded.userId);
    console.log("Utilisateur trouvé:", user ? "Oui" : "Non");

    if (!user) {
      console.log("Utilisateur non trouvé pour l'ID:", decoded.userId);
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Définir le rôle de l'utilisateur comme admin
    user.role = "admin";

    // Ajouter le nom complet de l'utilisateur
    user.fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      "Administrateur";

    // Ajouter l'ID comme chaîne de caractères pour éviter les problèmes de conversion
    user.id = user.id.toString();

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

/**
 * Middleware d'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const authenticateToken = (req, res, next) => {
  console.log(`Middleware d'authentification appelé pour ${req.path}`);

  // Récupérer le token du header Authorization
  const authHeader = req.headers["authorization"];
  console.log(`En-tête Authorization: ${authHeader ? "Présent" : "Absent"}`);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Token manquant ou format incorrect");
    return res
      .status(401)
      .json({ message: "Accès non autorisé. Token manquant." });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Token extrait: ${token.substring(0, 10)}...`);

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "smartplanningai_secret_key"
    );
    console.log(`Token décodé:`, decoded);

    // Vérifier si l'utilisateur existe
    User.findById(decoded.userId)
      .then((user) => {
        console.log(`Utilisateur trouvé: ${user ? "Oui" : "Non"}`);

        if (!user) {
          return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        next();
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la vérification de l'utilisateur:",
          error
        );
        res.status(500).json({ message: "Erreur serveur" });
      });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = {
  auth,
  checkRole,
  generateToken,
  JWT_SECRET,
  authenticateToken,
};
