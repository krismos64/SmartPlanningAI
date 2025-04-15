const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

// Afficher les variables d'environnement
console.log("Variables d'environnement:");
console.log("- PORT:", process.env.PORT);
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_NAME:", process.env.DB_NAME);
console.log("- FRONTEND_URL:", process.env.FRONTEND_URL);

const connectDB = require("../config/db");
const User = require("../models/User");

// Créer l'application Express
const app = express();

// Configuration CORS simplifiée
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de journalisation détaillée
app.use((req, res, next) => {
  console.log(`\n🔍 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));

  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "***";
    console.log("📦 Body:", JSON.stringify(sanitizedBody, null, 2));
  }

  next();
});

// Route de connexion simplifiée
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Tentative de connexion");

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Email ou mot de passe manquant");
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    console.log(`👤 Recherche de l'utilisateur avec l'email: ${email}`);

    // Récupérer l'utilisateur
    const user = await User.findByEmail(email);

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    console.log("✅ Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("🔍 Vérification du mot de passe");
    console.log("📝 Mot de passe haché stocké:", user.password);

    // Vérifier si le mot de passe est au format bcrypt
    const isBcrypt =
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    console.log("📝 Format bcrypt:", isBcrypt);

    if (!isBcrypt) {
      console.log("❌ Le mot de passe stocké n'est pas au format bcrypt");
      return res
        .status(500)
        .json({ message: "Erreur de format de mot de passe." });
    }

    try {
      // Comparer les mots de passe directement avec bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("📝 Résultat de la comparaison bcrypt:", isMatch);

      if (!isMatch) {
        console.log("❌ Mot de passe incorrect");
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect." });
      }
    } catch (bcryptError) {
      console.error("❌ Erreur bcrypt:", bcryptError);
      return res
        .status(500)
        .json({ message: "Erreur lors de la vérification du mot de passe." });
    }

    console.log("✅ Authentification réussie");

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "smartplanningai_secret_key",
      { expiresIn: "1d" }
    );

    console.log("🎟️ Token JWT généré");

    // Retourner les informations de l'utilisateur sans le mot de passe
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:", error);
    console.error("📚 Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
});

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Serveur de débogage d'authentification en cours d'exécution",
  });
});

// Fonction pour trouver un port disponible
const findAvailablePort = (startPort, maxAttempts = 10) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryPort = (port) => {
      attempts++;
      const server = require("http").createServer();

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(
            `Port ${port} déjà utilisé, essai du port ${port + 1}...`
          );
          if (attempts >= maxAttempts) {
            reject(
              new Error(
                `Impossible de trouver un port disponible après ${maxAttempts} tentatives`
              )
            );
          } else {
            tryPort(port + 1);
          }
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        server.close(() => resolve(port));
      });
    };

    tryPort(startPort);
  });
};

// Connecter à la base de données avant de démarrer le serveur
(async () => {
  try {
    // Tester la connexion à la base de données
    await connectDB();

    // Trouver un port disponible en commençant par 5001
    const PORT = await findAvailablePort(5001);

    // Créer un utilisateur de test
    const testUser = {
      username: "test.user",
      email: "test@example.com",
      password: "password123",
      role: "admin",
      first_name: "Test",
      last_name: "User",
    };

    // Insérer l'utilisateur dans la base de données
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)",
      [
        testUser.username,
        testUser.email,
        testUser.password,
        testUser.role,
        testUser.first_name,
        testUser.last_name,
      ]
    );

    // Récupérer l'utilisateur créé
    const [users] = await pool.query(
      "SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?",
      [result.insertId]
    );

    // Afficher les informations de l'utilisateur
    console.log("Utilisateur créé:", {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      role: users[0].role,
      first_name: users[0].first_name,
      last_name: users[0].last_name,
    });

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(
        `\n🚀 Serveur de débogage d'authentification démarré sur le port ${PORT}`
      );
      console.log(
        `🔐 Route de connexion disponible sur http://localhost:${PORT}/api/auth/login`
      );
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du serveur:", error);
    process.exit(1);
  }
})();

// Gérer les erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("\n💥 Erreur non capturée:", error);
  console.error("📚 Stack trace:", error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n💥 Promesse rejetée non gérée:", reason);
  console.error("📚 Promise:", promise);
});
