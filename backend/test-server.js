/**
 * Serveur de test simplifié pour les routes CSRF et d'authentification
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Charger les variables d'environnement
const envFile =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, ".env.production")
    : path.join(__dirname, ".env.development");

console.log(`🔧 Chargement des variables d'environnement depuis ${envFile}`);
dotenv.config({ path: envFile });

// Créer l'application Express
const app = express();

// Configuration CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "CSRF-Token",
      "csrf-token",
      "xsrf-token",
    ],
    exposedHeaders: ["X-CSRF-Token", "CSRF-Token", "csrf-token", "xsrf-token"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(
  session({
    secret: process.env.JWT_SECRET || "smart_planning_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // En développement
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  })
);

// Connexion à la base de données
let pool;
async function connectToDatabase() {
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "smartplanningai",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("✅ Connexion à la base de données réussie");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
    return false;
  }
}

// Middleware CSRF
function generateCSRFToken(req, res, next) {
  // Utiliser crypto.randomUUID() pour un token plus court mais toujours sécurisé
  const csrfToken = crypto.randomUUID
    ? crypto.randomUUID()
    : crypto.randomBytes(32).toString("hex");

  // Stocker le token dans la session
  if (req.session) {
    req.session.csrfToken = csrfToken;
    console.log(
      `✅ [CSRF] Token généré et stocké en session: ${csrfToken.substring(
        0,
        8
      )}...`
    );
  } else {
    console.error(
      "❌ [CSRF] Session non disponible pour stocker le token CSRF"
    );
  }

  // Rendre le token disponible pour le prochain middleware
  res.locals.csrfToken = csrfToken;
  next();
}

function verifyCSRFToken(req, res, next) {
  // Ne pas vérifier pour les méthodes GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Récupérer le token de l'en-tête
  const tokenFromHeader =
    req.headers["x-csrf-token"] ||
    req.headers["csrf-token"] ||
    req.headers["xsrf-token"];

  // Récupérer le token stocké en session
  const tokenFromSession = req.session?.csrfToken;

  // Log détaillé pour le débogage
  console.log(
    `[CSRF] Vérification - En-tête: ${
      tokenFromHeader?.substring(0, 8) || "manquant"
    }, Session: ${tokenFromSession?.substring(0, 8) || "manquant"}`
  );

  // Vérifications
  if (!tokenFromHeader) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF manquant dans l'en-tête",
    });
  }

  if (!tokenFromSession) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF non trouvé en session",
    });
  }

  if (tokenFromHeader !== tokenFromSession) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF invalide",
    });
  }

  // Token valide
  console.log(`✅ [CSRF] Token valide pour ${req.method} ${req.originalUrl}`);
  next();
}

// Routes
// 1. Route CSRF-token
app.get("/api/csrf-token", generateCSRFToken, (req, res) => {
  const csrfToken = res.locals.csrfToken;

  console.log(
    `🔐 [CSRF Production] Token généré: ${csrfToken.substring(0, 10)}... pour ${
      req.headers.origin || "client inconnu"
    }`
  );

  res.json({
    csrfToken,
  });
});

// 2. Route d'inscription
app.post("/api/auth/register", verifyCSRFToken, async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    console.log("📝 Tentative d'inscription:", {
      email,
      first_name,
      last_name,
    });

    // Vérifier si l'utilisateur existe déjà
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    // Hashage du mot de passe (simplifié pour le test)
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Insertion dans la base de données
    const result = await pool.query(
      "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, first_name || "", last_name || "", "admin"]
    );

    // Créer un token JWT (simplifié)
    const token = crypto.randomBytes(32).toString("hex");

    // Stocker le token en session
    req.session.userId = result.insertId;

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      token,
      user: {
        id: result.insertId,
        email,
        first_name: first_name || "",
        last_name: last_name || "",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
});

// 3. Route de connexion
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    console.log("🔑 Tentative de connexion:", { email });

    // Vérifier si l'utilisateur existe
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const user = users[0];

    // Vérifier le mot de passe (simplifié pour le test)
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Créer un token JWT (simplifié)
    const token = crypto.randomBytes(32).toString("hex");

    // Stocker le token en session
    req.session.userId = user.id;

    // Configurer les cookies
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, // En développement
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "admin",
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
});

// 4. Route de vérification d'authentification
app.get("/api/auth/check", async (req, res) => {
  try {
    // Vérifier si l'ID utilisateur est stocké en session
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    // Récupérer les informations de l'utilisateur
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    const user = users[0];

    res.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "admin",
      },
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la vérification d'authentification:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification d'authentification",
    });
  }
});

// 5. Route de déconnexion
app.post("/api/auth/logout", (req, res) => {
  // Détruire la session
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la destruction de la session:", err);
    }
  });

  // Effacer les cookies
  res.clearCookie("accessToken");
  res.clearCookie("connect.sid");

  res.json({
    success: true,
    message: "Déconnexion réussie",
  });
});

// Route ping pour vérifier que le serveur est en ligne
app.get("/ping", (req, res) => {
  res.json({ message: "Serveur de test en ligne" });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;

async function startServer() {
  // Se connecter à la base de données
  const isConnected = await connectToDatabase();

  if (!isConnected) {
    console.log("⚠️ Démarrage du serveur sans connexion à la base de données");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log(`📝 Mode : ${process.env.NODE_ENV || "development"}`);
    console.log(
      "🔒 Routes CSRF et d'authentification disponibles pour les tests"
    );
  });
}

startServer();
