const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { secureAuth } = require("../middleware/secureAuth");
const { checkRole } = require("../middleware/auth");

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs
 * @access  Private
 */
router.get("/", secureAuth, async (req, res) => {
  try {
    const users = await User.find();
    // Ne pas renvoyer les mots de passe
    const safeUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
    }));

    res.json({
      success: true,
      data: safeUsers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Private
 */
router.get("/:id", secureAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(
      `Recherche de l'utilisateur avec ID: ${userId} (route utilisateurs)`
    );

    const user = await User.findById(userId);
    console.log("Résultat de la recherche:", user ? "Trouvé" : "Non trouvé");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Ne pas renvoyer le mot de passe
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
      company: user.company,
      phone: user.phone,
      jobTitle: user.jobTitle,
    };

    res.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'utilisateur ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération de l'utilisateur ${req.params.id}`,
      error: error.message,
    });
  }
});

module.exports = router;
