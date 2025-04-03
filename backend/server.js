require("dotenv").config();

const express = require("express");
const cors = require("cors");
// Ajout des packages de sécurité
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
// Utiliser db directement dans un commentaire pour indiquer son utilisation implicite
// db est utilisé implicitement pour établir la connexion à la base de données au démarrage
const fs = require("fs");
const path = require("path");
const http = require("http");
const setupWebSocket = require("./config/websocket");
const Activity = require("./models/Activity");
const {
  generateCsrfToken,
  verifyCsrfToken,
} = require("./middleware/csrfMiddleware");
const { secureAuth } = require("./middleware/secureAuth");
const crypto = require("crypto");

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

const app = express();

// Connecter à la base de données - db est maintenant un pool, pas une fonction
// La connexion est testée au démarrage dans le module db.js

// Configuration CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "https://smartplanning.fr",
    "https://smartplanning.fr",
    "https://www.smartplanning.fr",
    "https://smartplanning.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-xsrf-token",
  ],
  credentials: true,
  maxAge: 86400, // 24 heures
};

// Appliquer CORS avant toute autre configuration
app.use(cors(corsOptions));

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

// Configuration du proxy pour gérer les en-têtes X-Forwarded-For
app.set("trust proxy", 1);

// Utiliser cookie-parser pour les cookies sécurisés
app.use(cookieParser());

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

// Middleware pour ajouter les en-têtes CORS manuellement
app.use((req, res, next) => {
  // Vérifier si l'origine de la requête est autorisée
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    // Si l'origine n'est pas dans la liste, utiliser la première origine comme fallback
    res.header("Access-Control-Allow-Origin", corsOptions.origin[0]);
  }

  res.header("Access-Control-Allow-Methods", corsOptions.methods.join(", "));
  res.header(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(", ")
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Route pour obtenir le token CSRF
app.get("/api/csrf-token", generateCsrfToken, (req, res) => {
  // Générer un token CSRF aléatoire
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // Stocker le token dans la session si elle existe
  if (req.session) {
    req.session.csrfToken = csrfToken;
  }

  // Envoyer le token dans un cookie non-HTTPOnly
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  console.log(`[CSRF] Token envoyé : XSRF-TOKEN=${csrfToken}`);

  // Retourner également le token dans la réponse JSON
  res.json({
    success: true,
    csrfToken,
  });
});

// Appliquer la vérification CSRF aux routes protégées
app.use("/api/auth", verifyCsrfToken, authRoutes);

// Routes nécessitant une authentification
app.use("/api/employees", secureAuth, employeesRoutes);
app.use("/api/vacations", secureAuth, vacationRequestsRoutes);
app.use("/api/weekly-schedules", secureAuth, weeklySchedulesRoutes);

// Utiliser le routeur de test pour les activités (sans authentification)
app.use("/api/activities/test", activitiesRoutes.testRouter);

// Protéger les autres routes des activités
app.use("/api/activities", secureAuth, activitiesRoutes);

app.use("/api/schedule-stats", secureAuth, scheduleStatsRoutes);
app.use("/api/work-hours", secureAuth, workHoursRoutes);
app.use("/api/hour-balance", hourBalanceRoutes);
app.use("/api/departments", secureAuth, departmentsRoutes);
app.use("/api/notifications", secureAuth, notificationsRoutes);
app.use("/api/chatbot", chatbotRoutes); // Le chatbot ne nécessite pas d'authentification
app.use("/api/user", secureAuth, authRoutes); // Exposer les routes d'authentification également sous /api/user
app.use("/api/users", secureAuth, usersRoutes); // Utiliser les routes utilisateurs spécifiques
app.use("/api/schedule", secureAuth, autoScheduleRoutes); // Routes pour la génération automatique de planning

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "SmartPlanning API" });
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

      // Log de l'activité avec tous les paramètres requis
      Activity.logActivity(
        "system", // type
        "server", // entity_type
        0, // entity_id
        `Serveur démarré sur le port ${port}`, // description
        null, // user_id
        JSON.stringify({
          port,
          pid: process.pid,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || "development",
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
        })
      ).catch((err) => {
        console.error("Erreur lors du log d'activité:", err);
      });
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
