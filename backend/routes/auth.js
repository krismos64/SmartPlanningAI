const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, auth, checkRole } = require("../middleware/auth");

// Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Générer un nom d'utilisateur à partir du prénom et du nom
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

    // Créer un nouvel utilisateur (toujours avec le rôle admin)
    const user = await User.create({
      username,
      email,
      password,
      role: "admin",
      firstName,
      lastName,
    });

    // Générer un token JWT
    const token = generateToken(user.id);

    // Retourner les informations de l'utilisateur sans le mot de passe
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
});

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    console.log("Tentative de connexion avec:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Email ou mot de passe manquant");
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("Utilisateur non trouvé:", email);
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    console.log("Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Vérifier le mot de passe
    try {
      const isMatch = await user.comparePassword(password);
      console.log("Résultat de la comparaison du mot de passe:", isMatch);

      if (!isMatch) {
        console.log("Mot de passe incorrect pour:", email);
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect." });
      }
    } catch (passwordError) {
      console.error(
        "Erreur lors de la vérification du mot de passe:",
        passwordError
      );
      return res
        .status(500)
        .json({ message: "Erreur lors de la vérification du mot de passe." });
    }

    // Générer un token JWT
    const token = generateToken(user.id);
    console.log("Token généré pour l'utilisateur:", user.id);

    // Retourner les informations de l'utilisateur sans le mot de passe
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get("/profile", auth, async (req, res) => {
  try {
    // req.user est défini par le middleware auth
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil." });
  }
});

// Route pour mettre à jour le profil de l'utilisateur
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé par un autre utilisateur.",
        });
      }
    }

    // Vérifier si le nouveau nom d'utilisateur est déjà utilisé
    if (username && username !== req.user.username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res
          .status(400)
          .json({ message: "Ce nom d'utilisateur est déjà pris." });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(userId, {
      username: username || req.user.username,
      email: email || req.user.email,
      password: password || req.user.password,
    });

    // Retourner les informations mises à jour
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil." });
  }
});

// Route pour vérifier si un utilisateur est authentifié
router.get("/check", auth, async (req, res) => {
  try {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la vérification de l'authentification",
    });
  }
});

// Route pour récupérer tous les utilisateurs (accessible à tous les utilisateurs)
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    // Ne pas renvoyer les mots de passe
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Route pour mettre à jour un utilisateur (accessible à tous les utilisateurs)
router.put("/users/:id", auth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== parseInt(userId)) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé par un autre utilisateur.",
        });
      }
    }

    // Vérifier si le nouveau nom d'utilisateur est déjà utilisé
    if (username && username !== user.username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== parseInt(userId)) {
        return res
          .status(400)
          .json({ message: "Ce nom d'utilisateur est déjà pris." });
      }
    }

    // Mettre à jour l'utilisateur
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      role: "admin", // Toujours définir le rôle comme admin
    };

    // Ajouter le mot de passe uniquement s'il est fourni
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData);

    // Retourner les informations mises à jour
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// Route pour supprimer un utilisateur (admin seulement)
router.delete("/users/:id", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Empêcher la suppression de son propre compte
    if (parseInt(userId) === req.user.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    // Supprimer l'utilisateur
    await User.delete(userId);

    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur." });
  }
});

module.exports = router;
