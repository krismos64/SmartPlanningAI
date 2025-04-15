const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, auth, checkRole } = require("../middleware/auth");
const { secureAuth } = require("../middleware/secureAuth");
const { authLimiter } = require("../middleware/rateLimit");
const {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const {
  verifyCsrfToken,
  logRequestDetails,
} = require("../middleware/csrfMiddleware");
const AuthLog = require("../models/AuthLog");
const crypto = require("crypto");
const passport = require("passport");
const connectDB = require("../config/db");

// Routes d'authentification Google OAuth 2.0
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Callback après authentification Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      process.env.NODE_ENV === "production"
        ? "https://smartplanning.fr/login?error=google-auth-failed"
        : "http://localhost:3000/login?error=google-auth-failed",
  }),
  async (req, res) => {
    try {
      console.log("🔑 Callback Google OAuth reçu");

      if (!req.user) {
        console.error(
          "❌ Authentification Google échouée: utilisateur non disponible"
        );
        return res.redirect(
          process.env.NODE_ENV === "production"
            ? "https://smartplanning.fr/login?error=auth-failed"
            : "http://localhost:3000/login?error=auth-failed"
        );
      }

      console.log(`✅ Utilisateur Google authentifié: ${req.user.email}`);

      // Générer les tokens JWT
      const tokens = generateTokens(req.user.id, req.user.role || "admin");

      // Définir les cookies avec la configuration sécurisée pour cross-domain
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        expires: tokens.accessExpires,
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        expires: tokens.refreshExpires,
      });

      // Cookie non-httpOnly pour le client JavaScript
      res.cookie("auth_token", tokens.accessToken, {
        secure: true,
        sameSite: "None",
        path: "/",
        httpOnly: false,
        expires: tokens.accessExpires,
      });

      // Enregistrer la tentative d'authentification réussie
      const ipAddress =
        req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.connection.remoteAddress;

      await AuthLog.create({
        email: req.user.email,
        ip: ipAddress,
        status: "success",
        message: "Authentification Google réussie",
        user_agent: req.headers["user-agent"],
      });

      // Rediriger vers le frontend avec le token JWT
      const redirectUrl = `${
        process.env.NODE_ENV === "production"
          ? "https://smartplanning.fr"
          : "http://localhost:3000"
      }/login-success?token=${tokens.accessToken}`;
      console.log(
        `🔄 Redirection vers: ${redirectUrl.substring(
          0,
          redirectUrl.indexOf("?")
        )}?token=...`
      );

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Erreur lors du callback Google:", error);
      return res.redirect(
        process.env.NODE_ENV === "production"
          ? "https://smartplanning.fr/login?error=server-error"
          : "http://localhost:3000/login?error=server-error"
      );
    }
  }
);

// Route pour déboguer les problèmes CSRF
router.post("/debug-csrf", (req, res) => {
  logRequestDetails(req);
  res.json({
    success: true,
    message: "Détails de requête enregistrés dans la console du serveur",
    headers: {
      "x-csrf-token": req.headers["x-csrf-token"],
      "csrf-token": req.headers["csrf-token"],
      "xsrf-token": req.headers["xsrf-token"],
    },
    cookies: req.cookies,
    sessionInfo: req.session
      ? {
          hasToken: !!req.session.csrfToken,
          tokenPrefix: req.session.csrfToken
            ? req.session.csrfToken.substring(0, 10) + "..."
            : null,
        }
      : "Session non disponible",
  });
});

// Route d'inscription
router.post("/register", authLimiter, async (req, res) => {
  // Initialiser un timer pour mesurer les performances
  const startTime = Date.now();
  let timingLog = { validation: 0, dbCheck: 0, userCreation: 0, tokenGen: 0 };

  try {
    // Extraction des données avec validation minimale
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

    // Validation de base des données requises
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis pour l'inscription",
      });
    }

    timingLog.validation = Date.now() - startTime;
    const dbCheckStart = Date.now();

    try {
      // Vérification directe avec une simple requête SQL, sans SELECT DATABASE()
      const [existingUsers] = await connectDB.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Un utilisateur avec cet email existe déjà",
        });
      }

      timingLog.dbCheck = Date.now() - dbCheckStart;
      const userCreationStart = Date.now();

      // Préparation des données utilisateur
      const userData = {
        email,
        password,
        role: "admin",
        first_name: first_name || null,
        last_name: last_name || null,
        profileImage: profileImage || null,
        company: company || null,
        phone: phone || null,
        jobTitle: jobTitle || null,
      };

      // Création de l'utilisateur avec un timeout de 15 secondes pour éviter un blocage sur Render
      let user;
      try {
        const createUserWithTimeout = async () => {
          // Créer une promesse pour la création d'utilisateur
          const createUserPromise = User.create(userData);

          // Créer une promesse de timeout de 15 secondes
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  "Délai d'attente dépassé lors de la création de l'utilisateur (15s)"
                )
              );
            }, 15000); // 15 secondes
          });

          // Utiliser Promise.race pour terminer soit par succès soit par timeout
          return await Promise.race([createUserPromise, timeoutPromise]);
        };

        // Exécuter la création avec timeout
        user = await createUserWithTimeout();
      } catch (createError) {
        // Capture spécifique des erreurs de création d'utilisateur
        if (createError.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "Cet email est déjà utilisé par un autre compte",
          });
        }

        // Erreur de timeout
        if (
          createError.message &&
          createError.message.includes("Délai d'attente dépassé")
        ) {
          console.error(
            "TIMEOUT: Création d'utilisateur trop longue",
            createError
          );
          return res.status(504).json({
            success: false,
            message:
              "Le serveur a mis trop de temps à répondre. Veuillez réessayer.",
            error: "TIMEOUT_ERROR",
          });
        }

        throw createError; // Remonter d'autres erreurs pour le catch global
      }

      timingLog.userCreation = Date.now() - userCreationStart;
      const tokenGenStart = Date.now();

      // Génération des tokens JWT
      const tokens = generateTokens(user.id, user.role || "admin");
      setTokenCookies(res, tokens);

      timingLog.tokenGen = Date.now() - tokenGenStart;

      // Stocker l'ID utilisateur dans la session (non-bloquant)
      if (req.session) {
        req.session.userId = user.id;
      }

      // Réponse JSON pour l'API
      if (
        req.headers.accept &&
        req.headers.accept.includes("application/json")
      ) {
        return res.status(201).json({
          success: true,
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            profileImage: user.profileImage || null,
            company: user.company || "",
            phone: user.phone || "",
            jobTitle: user.jobTitle || "",
          },
          timingInfo:
            process.env.NODE_ENV === "development" ? timingLog : undefined,
        });
      } else {
        // Redirection pour le formulaire standard
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
      }
    } catch (dbError) {
      // Erreurs spécifiques à la base de données
      console.error(
        "Erreur de base de données lors de l'inscription:",
        dbError
      );
      return res.status(500).json({
        success: false,
        message: "Erreur de connexion à la base de données",
        error:
          process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }
  } catch (error) {
    // Traiter toutes les autres erreurs
    console.error("Erreur lors de l'inscription:", error);
    const totalTime = Date.now() - startTime;
    console.error(`Échec après ${totalTime}ms. Timings partiels:`, timingLog);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Route pour s'authentifier
router.post("/login", async (req, res) => {
  console.log("=== DEMANDE DE CONNEXION REÇUE ===");
  console.log("Headers de requête:", req.headers);
  console.log("Body de requête:", {
    ...req.body,
    password: req.body.password ? "****" : "non fourni",
  });

  // Récupérer l'adresse IP réelle derrière un proxy
  const ipAddress =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress;

  // Récupérer le user-agent
  const userAgent = req.headers["user-agent"];

  try {
    const { email, password } = req.body;

    // Valider les champs requis
    if (!email || !password) {
      // Enregistrer la tentative d'authentification échouée
      await AuthLog.create({
        email: email || "non fourni",
        ip: ipAddress,
        status: "failed",
        message: "Email ou mot de passe non fourni",
        user_agent: userAgent,
      });

      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    // Vérifier les identifiants
    const user = await User.findByEmail(email);

    // Si l'utilisateur n'existe pas
    if (!user) {
      // Enregistrer la tentative d'authentification échouée
      await AuthLog.create({
        email,
        ip: ipAddress,
        status: "failed",
        message: "Email inconnu",
        user_agent: userAgent,
      });

      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Enregistrer la tentative d'authentification échouée
      await AuthLog.create({
        email,
        ip: ipAddress,
        status: "failed",
        message: "Mot de passe incorrect",
        user_agent: userAgent,
      });

      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Authentification réussie - Enregistrer la tentative d'authentification réussie
    await AuthLog.create({
      email,
      ip: ipAddress,
      status: "success",
      message: "Authentification réussie",
      user_agent: userAgent,
    });

    // Générer les tokens
    const tokens = generateTokens(user.id, user.role);
    setTokenCookies(res, tokens);

    // Stocker l'ID utilisateur dans la session
    if (req.session) {
      req.session.userId = user.id;
      console.log(`✅ Session utilisateur mise à jour - ID: ${user.id}`);
    } else {
      console.warn(
        "⚠️ Session non disponible - Impossible de sauvegarder l'ID utilisateur"
      );
    }

    // Vérifier si le client attend une réponse JSON ou peut accepter une redirection
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      // Le client attend une réponse JSON (API fetch)
      console.log("📤 Envoi de la réponse JSON après authentification réussie");
      return res.json({
        success: true,
        token: tokens.accessToken, // Pour la rétrocompatibilité
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          profileImage: user.profileImage,
          company: user.company,
          phone: user.phone,
          jobTitle: user.jobTitle,
        },
      });
    } else {
      // Le client peut gérer une redirection (formulaire standard)
      console.log("🔄 Redirection vers le dashboard après connexion réussie");
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);

    // Enregistrer l'erreur interne
    try {
      await AuthLog.create({
        email: req.body.email || "non fourni",
        ip: ipAddress,
        status: "failed",
        message: `Erreur interne: ${error.message}`,
        user_agent: userAgent,
      });
    } catch (logError) {
      console.error("Erreur lors de l'enregistrement du log:", logError);
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get("/profile", secureAuth, async (req, res) => {
  try {
    console.log("=== ROUTE /profile APPELÉE ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Cookies:", req.cookies);

    // req.user est défini par le middleware auth
    console.log("req.user présent:", !!req.user);
    console.log(
      "Données utilisateur disponibles dans /profile:",
      req.user
        ? {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name || null,
            last_name: req.user.last_name || null,
            // Ne pas log l'image complète
            profileImage: req.user.profileImage ? "présent" : "absent",
            company: req.user.company || null,
            phone: req.user.phone || null,
            jobTitle: req.user.jobTitle || null,
          }
        : "Utilisateur non disponible"
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }

    // Vérifier si les données du profil sont complètes
    const profileData = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      first_name: req.user.first_name || "",
      last_name: req.user.last_name || "",
      profileImage: req.user.profileImage || null,
      company: req.user.company || "",
      phone: req.user.phone || "",
      jobTitle: req.user.jobTitle || "",
    };

    console.log("Données de profil renvoyées:", {
      ...profileData,
      profileImage: profileData.profileImage ? "présent" : "absent",
    });

    res.json(profileData);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil.",
      error: error.message,
    });
  }
});

// Route pour mettre à jour le profil de l'utilisateur
router.put("/profile", secureAuth, async (req, res) => {
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
router.get("/check", secureAuth, async (req, res) => {
  try {
    // Récupérer l'utilisateur complet
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Renvoyer les informations utilisateur complètes
    res.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        profileImage: user.profileImage || null,
        company: user.company || "",
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'authentification",
    });
  }
});

// Route pour récupérer tous les utilisateurs
router.get("/users", secureAuth, async (req, res) => {
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

// Route pour récupérer un utilisateur spécifique par son ID (sans /users/ préfixe)
router.get("/:id", secureAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(
      `Recherche de l'utilisateur avec ID: ${userId} (route directe)`
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

// Route pour récupérer un utilisateur spécifique par son ID
router.get("/users/:id", secureAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Recherche de l'utilisateur avec ID: ${userId}`);

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

// Route pour mettre à jour un utilisateur
router.put("/users/:id", secureAuth, async (req, res) => {
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
router.delete(
  "/users/:id",
  secureAuth,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Empêcher la suppression de son propre compte
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({
          message: "Vous ne pouvez pas supprimer votre propre compte.",
        });
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
  }
);

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

// Route de déconnexion sécurisée
router.post("/logout", (req, res) => {
  // Effacer les cookies de tokens
  clearTokenCookies(res);

  // Détruire la session si elle existe
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erreur lors de la destruction de la session:", err);
      } else {
        console.log("Session détruite avec succès");
      }
    });

    // Supprimer le cookie de session
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }

  // Répondre avec succès
  res.json({
    success: true,
    message: "Déconnexion réussie",
  });
});

// Route pour rafraîchir le token d'accès avec un refresh token
router.post("/refresh", async (req, res) => {
  try {
    // Récupérer le refresh token depuis les cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Token de rafraîchissement manquant",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      // Si le token est invalide, effacer les cookies et demander une reconnexion
      clearTokenCookies(res);

      return res.status(401).json({
        success: false,
        message: "Session expirée, veuillez vous reconnecter",
        code: "REFRESH_TOKEN_INVALID",
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);

    if (!user) {
      clearTokenCookies(res);

      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    // Générer de nouveaux tokens
    const tokens = generateTokens(user.id, user.role || "admin");
    setTokenCookies(res, tokens);

    // Renvoyer les informations utilisateur mises à jour
    return res.json({
      success: true,
      token: tokens.accessToken, // Pour la rétrocompatibilité
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);

    // En cas d'erreur, effacer les cookies et demander une reconnexion
    clearTokenCookies(res);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du rafraîchissement de la session",
      code: "REFRESH_ERROR",
    });
  }
});

/**
 * @route   GET /api/auth/current-admin
 * @desc    Récupérer l'ID et les informations de l'admin connecté
 * @access  Private
 */
router.get("/current-admin", auth, async (req, res) => {
  try {
    // Récupérer l'ID de l'admin connecté
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(400).json({ message: "Non authentifié" });
    }

    // Récupérer les informations complètes de l'admin
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // Retourner les informations sécurisées (sans le mot de passe)
    const safeAdmin = {
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      company: admin.company,
      phone: admin.phone,
      jobTitle: admin.jobTitle,
      fullName:
        `${admin.first_name || ""} ${admin.last_name || ""}`.trim() ||
        "Administrateur",
    };

    res.json(safeAdmin);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'admin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
