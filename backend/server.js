// Charger les variables d'environnement dès le début
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");

// Charger le fichier .env approprié selon l'environnement
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Afficher un message de débogage pour les variables Google
console.log("🔑 Variables Google OAuth:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Défini" : "Non défini",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    ? "Défini"
    : "Non défini",
});

const express = require("express");
// Ajout des packages de sécurité
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
// Ajouter express-session et le store MySQL
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
// Utiliser db directement dans un commentaire pour indiquer son utilisation implicite
// db est utilisé implicitement pour établir la connexion à la base de données au démarrage
const fs = require("fs");
const setupWebSocket = require("./config/websocket");
const Activity = require("./models/Activity");
const {
  generateCsrfToken,
  verifyCsrfToken,
} = require("./middleware/csrfMiddleware");
const { secureAuth } = require("./middleware/secureAuth");
const crypto = require("crypto");
const passport = require("passport");

// Rendre le modèle Activity disponible globalement
global.Activity = Activity;

// Import des routes
const employeesRoutes = require("./routes/employees");
const vacationRequestsRoutes = require("./routes/vacations");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users"); // Import des routes utilisateurs
const weeklySchedulesRoutes = require("./routes/weeklySchedules");
const activitiesRoutes = require("./routes/activities");
const scheduleStatsRoutes = require("./routes/scheduleStats");
const workHoursRoutes = require("./routes/workHoursRoutes");
const hourBalanceRoutes = require("./routes/hourBalance");
const departmentsRoutes = require("./routes/departments");
const notificationsRoutes = require("./routes/notifications");
const chatbotRoutes = require("./routes/chatbotRoutes");
const autoScheduleRoutes = require("./routes/autoSchedule");
const contactRoutes = require("./routes/contact");

const app = express();
const port = process.env.PORT || 5001;

// Connecter à la base de données - db est maintenant un pool, pas une fonction
// La connexion est testée au démarrage dans le module db.js

// Configuration CORS
const corsOptions = {
  origin: [
    "https://smartplanning.fr",
    "https://www.smartplanning.fr",
    "https://smartplanning.onrender.com/api ",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-xsrf-token",
    "Origin",
    "Accept",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie", "Date", "ETag"],
  credentials: true,
  maxAge: 86400,
};

// Appliquer CORS avant toute autre configuration
app.use(cors(corsOptions));

// Configuration du proxy pour gérer les en-têtes X-Forwarded-For
app.set("trust proxy", 1);

// Utiliser cookie-parser pour les cookies sécurisés
app.use(cookieParser());

// Configuration du store MySQL pour les sessions
const dbOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const sessionStore = new MySQLStore(dbOptions);

// Configuration et mise en place du middleware express-session
app.use(
  session({
    key: "sid", // Nom du cookie
    secret: process.env.SESSION_SECRET || "smartplanning_session_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    credentials: true, // Important pour la gestion des sessions cross-domain
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Cookies sécurisés (HTTPS) seulement en production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Ajuster selon l'environnement
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  })
);

console.log(
  "✅ Session configurée avec MySQL Store et cookie sécurisé (sameSite: None)"
);

// Configuration de Helmet pour sécuriser les en-têtes HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "wss:", "https://smartplanning.onrender.com"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Configuration des limites de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // limite plus stricte en production
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard",
  },
});

// Appliquer le limiteur à toutes les routes
app.use("/api/", limiter);

// Configuration pour traiter les données JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Créer le dossier de logs s'il n'existe pas
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Fonction pour écrire dans le fichier de log
const logToFile = (type, message) => {
  const logFile = path.join(logsDir, "error.log");
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type}] ${message}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture dans le fichier de log:", err);
    }
  });
};

// Middleware de journalisation des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.url}`;
  console.log(logMessage);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
    logToFile("REQUEST", `${logMessage} - Body: ${JSON.stringify(req.body)}`);
  } else {
    logToFile("REQUEST", logMessage);
  }

  // Intercepter la réponse pour logger le statut
  const originalSend = res.send;
  res.send = function (body) {
    const statusCode = res.statusCode;
    const responseLogMessage = `${timestamp} - ${req.method} ${req.url} - Status: ${statusCode}`;

    if (statusCode >= 400) {
      console.error(responseLogMessage);
      logToFile("ERROR", `${responseLogMessage} - Response: ${body}`);
    } else {
      console.log(responseLogMessage);
      logToFile("RESPONSE", responseLogMessage);
    }

    originalSend.call(this, body);
    return this;
  };

  next();
});

// Route pour obtenir le token CSRF
app.get("/csrf-token", generateCsrfToken, (req, res) => {
  // Générer un token CSRF aléatoire
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // Stocker le token dans la session si elle existe
  if (req.session) {
    req.session.csrfToken = csrfToken;
    console.log(
      "🔐 [CSRF] Token généré et stocké en session:",
      csrfToken.substring(0, 10) + "..."
    );
  } else {
    console.warn("⚠️ [CSRF] Session non disponible pour stocker le token");
  }

  // Retourner le token dans la réponse JSON
  res.json({
    success: true,
    csrfToken,
    message: "Token CSRF généré avec succès",
  });
});

// ===== CONFIGURATION DE PASSPORT =====
// Configuration de Passport.js pour l'authentification

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Sérialisation et désérialisation de l'utilisateur pour les sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Importer et configurer la stratégie Google
require("./auth/google");

// ===== ROUTES =====
// Routes d'authentification avec gestion spéciale pour Google
app.use(
  "/api/auth",
  (req, res, next) => {
    // Exclure les routes Google de la vérification CSRF
    if (req.path.startsWith("/google")) {
      return next();
    }
    verifyCsrfToken(req, res, next);
  },
  authRoutes
);

// Routes nécessitant une authentification
app.use("/api/employees", secureAuth, employeesRoutes);
app.use("/api/vacations", secureAuth, vacationRequestsRoutes);
app.use("/api/weekly-schedules", secureAuth, weeklySchedulesRoutes);

// Utiliser le routeur de test pour les activités (sans authentification)
app.use("/api/activities/test", activitiesRoutes.testRouter);

// Protéger les autres routes des activités
app.use("/api/activities", secureAuth, activitiesRoutes);
app.use("/api/notifications", secureAuth, notificationsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", secureAuth, authRoutes);
app.use("/api/users", secureAuth, usersRoutes); // Utiliser les routes utilisateurs spécifiques
app.use("/api/schedule", secureAuth, autoScheduleRoutes); // Routes pour la génération automatique de planning
app.use("/api/hour-balance", secureAuth, hourBalanceRoutes); // Routes pour le solde d'heures
app.use("/api/work-hours", secureAuth, workHoursRoutes); // Routes pour les heures de travail

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "SmartPlanning API" });
});

// Route de test pour vérifier les variables d'environnement
app.get("/api/env-check", (req, res) => {
  res.json({
    env: process.env.NODE_ENV || "non défini",
    googleConfigured: !!(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    googleClientId: process.env.GOOGLE_CLIENT_ID
      ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "..."
      : "non défini",
    port: process.env.PORT || "défaut",
    frontendUrl: process.env.FRONTEND_URL || "non défini",
  });
});

// Route de test directe pour le changement de mot de passe
const { changePassword } = require("./controllers/usersController");
app.post("/api/test-password-change", secureAuth, (req, res) => {
  console.log("Route de test pour le changement de mot de passe appelée");
  return changePassword(req, res);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  console.error("Stack trace:", err.stack);

  // Logger l'erreur dans le fichier
  logToFile("ERROR", `Erreur serveur: ${err.message}\nStack: ${err.stack}`);

  res.status(500).json({
    error: "Une erreur est survenue",
    message: err.message || "Erreur interne du serveur",
  });
});

// Fichier de verrouillage pour éviter les démarrages multiples
const lockFile = path.join(__dirname, "server.lock");

// Fonction pour vérifier si le serveur est déjà en cours d'exécution
const checkServerRunning = () => {
  try {
    if (fs.existsSync(lockFile)) {
      const pid = parseInt(fs.readFileSync(lockFile, "utf8"));
      try {
        process.kill(pid, 0);
        return true;
      } catch (e) {
        fs.unlinkSync(lockFile);
        return false;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Fonction pour trouver un port disponible
const getAvailablePort = async (startPort) => {
  const net = require("net");

  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
};

const startServer = async () => {
  try {
    // Vérifier si le serveur est déjà en cours d'exécution
    if (checkServerRunning()) {
      console.error("Le serveur est déjà en cours d'exécution");
      process.exit(1);
    }

    // Utiliser le port fourni par Render ou trouver un port disponible
    const port = process.env.PORT || (await getAvailablePort(5001));
    const server = http.createServer(app);

    // Configurer WebSocket
    setupWebSocket(server);

    // Démarrer le serveur
    server.listen(port, () => {
      console.log(`✅ Serveur démarré sur le port ${port}`);
      console.log(`📝 Mode: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔌 Base de données: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`
      );
      console.log(`🌐 API accessible à http://localhost:${port}/api`);

      // Le log d'activité n'est pas essentiel au démarrage et peut ralentir le cold start
    });

    // Gérer les erreurs de serveur
    server.on("error", (error) => {
      console.error("Erreur du serveur:", error);
      // Gérer la fermeture proprement
      if (fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch (err) {
          console.error(
            "Erreur lors de la suppression du fichier de lock:",
            err
          );
        }
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

// Gérer les erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("Erreur non capturée:", error);
  console.error("Stack trace:", error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Promesse rejetée non gérée:", reason);
  console.error("Promise:", promise);
});

startServer();
