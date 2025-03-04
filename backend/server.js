require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

// Import des routes
const authRoutes = require("./routes/auth");
const employeesRoutes = require("./routes/employees");
const planningRoutes = require("./routes/planning");
const vacationsRoutes = require("./routes/vacations");

const app = express();

// Connecter à la base de données
connectDB();

// Configuration CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5002",
    "http://localhost:3000",
    "http://localhost:5004",
    "http://localhost:5005",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

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
app.use("/api/planning", planningRoutes);
app.use("/api/vacations", vacationsRoutes);
app.use("/api/auth", authRoutes);

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

// Vérifier si le serveur est déjà en cours d'exécution
const isServerRunning = () => {
  try {
    if (fs.existsSync(lockFile)) {
      const pid = fs.readFileSync(lockFile, "utf8");

      // Vérifier si le processus existe toujours
      try {
        process.kill(parseInt(pid, 10), 0);
        console.log(
          `⚠️ Le serveur est déjà en cours d'exécution avec le PID ${pid}`
        );
        return true;
      } catch (e) {
        // Le processus n'existe plus, on peut supprimer le fichier de verrouillage
        fs.unlinkSync(lockFile);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification du serveur:", error);
    return false;
  }
};

// Port dynamique avec limite de tentatives
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

    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
      console.log(
        `🔑 JWT Secret: ${
          process.env.JWT_SECRET || "smartplanningai_secret_key"
        }`
      );
      console.log(`🌐 CORS Origins: ${JSON.stringify(corsOptions.origin)}`);
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
