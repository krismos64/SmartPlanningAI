const User = require("../models/User");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Provenant du middleware d'authentification

    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérification de la correspondance des mots de passe
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }

    // Validation de la force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
      });
    }

    // Récupération de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification de l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Échec de la mise à jour" });
    }

    // Hashage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mise à jour du mot de passe
    await connectDB.execute(
      "UPDATE users SET password = ?, password_updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId]
    );

    // Log de l'activité avec la structure complète de la table
    try {
      await connectDB.execute(
        `INSERT INTO activities (
          type, 
          entity_type, 
          entity_id, 
          description, 
          user_id, 
          ip_address, 
          user_agent, 
          details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "security", // type
          "user", // entity_type
          userId.toString(), // entity_id
          "Mot de passe modifié", // description
          userId, // user_id
          req.ip || "", // ip_address
          req.headers["user-agent"] || "", // user_agent
          JSON.stringify({
            // details
            action: "password_change",
            timestamp: new Date(),
          }),
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      // On continue même si le logging échoue
    }

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
};

module.exports = {
  changePassword,
};
