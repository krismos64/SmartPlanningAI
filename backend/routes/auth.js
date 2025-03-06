const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, auth, checkRole } = require("../middleware/auth");

// Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      profileImage,
      company,
      phone,
      jobTitle,
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Créer un nouvel utilisateur (toujours avec le rôle admin)
    const user = await User.create({
      email,
      password,
      role: "admin",
      first_name,
      last_name,
      profileImage,
      company,
      phone,
      jobTitle,
    });

    // Générer un token JWT
    const token = generateToken(user.id);

    // Retourner les informations de l'utilisateur sans le mot de passe
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      profileImage: user.profileImage,
      company: user.company,
      phone: user.phone,
      jobTitle: user.jobTitle,
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
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      profileImage: user.profileImage,
      company: user.company,
      phone: user.phone,
      jobTitle: user.jobTitle,
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
      email: req.user.email,
      role: req.user.role,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      profileImage: req.user.profileImage,
      company: req.user.company,
      phone: req.user.phone,
      jobTitle: req.user.jobTitle,
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
    const userId = req.user.id;
    console.log("Données reçues pour la mise à jour du profil:", {
      ...req.body,
      profileImageLength: req.body.profileImage
        ? req.body.profileImage.length
        : 0,
    });

    // Extraire les données du corps de la requête
    const {
      email,
      first_name,
      last_name,
      profileImage,
      company,
      phone,
      jobTitle,
    } = req.body;

    // Préparer les données pour la mise à jour
    // Utiliser les valeurs existantes si les nouvelles valeurs sont undefined
    const updateData = {
      email: email === undefined ? req.user.email : email,
      first_name: first_name === undefined ? req.user.first_name : first_name,
      last_name: last_name === undefined ? req.user.last_name : last_name,
      // Pour profileImage, on garde l'ancienne valeur si undefined ou null est fourni
      profileImage:
        profileImage === undefined ? req.user.profileImage : profileImage,
      company: company === undefined ? req.user.company : company,
      phone: phone === undefined ? req.user.phone : phone,
      jobTitle: jobTitle === undefined ? req.user.jobTitle : jobTitle,
    };

    // S'assurer qu'aucune valeur n'est undefined (remplacer par null si nécessaire)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        updateData[key] = null;
      }
    });

    // Exclure explicitement le mot de passe des données de mise à jour
    // Le mot de passe ne doit être mis à jour que via une route dédiée
    updateData.password = undefined;

    console.log("Données préparées pour la mise à jour:", {
      ...updateData,
      profileImageLength: updateData.profileImage
        ? updateData.profileImage.length
        : 0,
    });

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(userId, updateData);

    // Retourner les informations mises à jour
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      profileImage: updatedUser.profileImage,
      company: updatedUser.company,
      phone: updatedUser.phone,
      jobTitle: updatedUser.jobTitle,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    console.error("Stack trace:", error.stack);
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

// Route pour récupérer tous les utilisateurs
router.get("/users", auth, async (req, res) => {
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
    res.json(safeUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Route pour mettre à jour un utilisateur
router.put("/users/:id", auth, async (req, res) => {
  try {
    const { email, password } = req.body;
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

    // Mettre à jour l'utilisateur
    const updateData = {
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
      email: updatedUser.email,
      role: updatedUser.role,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
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

// Route de test pour l'authentification
router.post("/test-login", async (req, res) => {
  try {
    // Créer un utilisateur de test
    const testUser = {
      id: 1,
      email: "test@example.com",
      role: "admin",
      first_name: "Test",
      last_name: "User",
    };

    // Générer un token JWT
    const token = generateToken(testUser.id);
    console.log("Token de test généré:", token);

    // Retourner les informations de l'utilisateur avec le token
    res.json({
      success: true,
      user: testUser,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du token de test:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du token de test.",
    });
  }
});

module.exports = router;
