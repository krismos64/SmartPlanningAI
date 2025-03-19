require("dotenv").config();

const express = require("express");
const cors = require("cors");
// Utiliser db directement dans un commentaire pour indiquer son utilisation implicite
// db est utilisé implicitement pour établir la connexion à la base de données au démarrage
const db = require("./config/db");
const fs = require("fs");
const path = require("path");
const http = require("http");
const setupWebSocket = require("./config/websocket");
const Activity = require("./models/Activity");

// Rendre le modèle Activity disponible globalement
global.Activity = Activity;

// Import des routes
const employeesRoutes = require("./routes/employees");
const vacationRequestsRoutes = require("./routes/vacations");
const authRoutes = require("./routes/auth");
const weeklySchedulesRoutes = require("./routes/weeklySchedules");
const activitiesRoutes = require("./routes/activities");
const scheduleStatsRoutes = require("./routes/scheduleStats");
const workHoursRoutes = require("./routes/workHoursRoutes");
const hourBalanceRoutes = require("./routes/hourBalance");
const departmentsRoutes = require("./routes/departments");
const notificationsRoutes = require("./routes/notifications");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

// Connecter à la base de données - db est maintenant un pool, pas une fonction
// La connexion est testée au démarrage dans le module db.js

// Configuration CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5002",
    "http://localhost:3000",
    "http://localhost:5004",
    "http://localhost:5005",
    "http://localhost:5007",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Sec-WebSocket-Key",
    "Sec-WebSocket-Version",
    "Sec-WebSocket-Extensions",
    "Sec-WebSocket-Protocol",
    "Upgrade",
    "Connection",
  ],
  exposedHeaders: ["Sec-WebSocket-Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors(corsOptions));

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

// Routes API
app.use("/api/employees", employeesRoutes);
app.use("/api/vacations", vacationRequestsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/weekly-schedules", weeklySchedulesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/schedule-stats", scheduleStatsRoutes);
app.use("/api/work-hours", workHoursRoutes);
app.use("/api/hour-balance", hourBalanceRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "SmartPlanning AI API" });
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
const isServerRunning = () => {
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
const findAvailablePort = async (startPort) => {
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
  // Vérifier si le serveur est déjà en cours d'exécution
  if (isServerRunning()) {
    console.log(
      "⛔ Le serveur est déjà en cours d'exécution. Arrêt du processus actuel."
    );
    process.exit(0);
    return;
  }

  try {
    const PORT = await findAvailablePort(
      parseInt(process.env.PORT || 5000, 10)
    );

    // Créer le fichier de verrouillage avec le PID actuel
    fs.writeFileSync(lockFile, process.pid.toString());

    // Nettoyer le fichier de verrouillage à la fermeture
    const cleanup = () => {
      try {
        if (fs.existsSync(lockFile)) {
          fs.unlinkSync(lockFile);
        }
      } catch (error) {
        console.error("Erreur lors du nettoyage:", error);
      }
      process.exit(0);
    };

    // Gérer les signaux de fermeture
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    // Créer un serveur HTTP
    const server = http.createServer(app);

    // Configurer le WebSocket
    // wss est utilisé implicitement par setupWebSocket pour gérer les connexions WebSocket
    setupWebSocket(server);
    console.log("🔌 WebSocket configuré et prêt à recevoir des connexions");

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
      console.log(
        `🔑 JWT Secret: ${
          process.env.JWT_SECRET || "smartplanningai_secret_key"
        }`
      );
      console.log(`🌐 CORS Origins: ${JSON.stringify(corsOptions.origin)}`);

      // Afficher les routes enregistrées
      console.log("Routes enregistrées:");
      app._router.stack.forEach(function (middleware) {
        if (middleware.route) {
          // routes registered directly on the app
          console.log(`Route: ${middleware.route.path}`);
        } else if (middleware.name === "router") {
          // router middleware
          middleware.handle.stack.forEach(function (handler) {
            if (handler.route) {
              const path = handler.route.path;
              const methods = Object.keys(handler.route.methods).join(", ");
              console.log(`Route: ${methods.toUpperCase()} ${path}`);
            }
          });
        }
      });

      // Enregistrer une activité de démarrage du serveur
      Activity.logActivity({
        type: "system",
        entity_type: "server",
        entity_id: 0,
        description: `Serveur démarré sur le port ${PORT}`,
        user_id: null,
        details: {
          port: PORT,
          pid: process.pid,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || "development",
        },
      }).catch((err) =>
        console.error(
          "Erreur lors de l'enregistrement de l'activité de démarrage:",
          err
        )
      );
    });

    // Gérer les erreurs de serveur
    server.on("error", (error) => {
      console.error("Erreur du serveur:", error);
      cleanup();
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
