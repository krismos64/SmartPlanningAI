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

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5002",
      "http://localhost:5004",
    ],
    credentials: true,
  })
);

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
  console.error(err.stack);
  res.status(500).json({
    error: "Une erreur est survenue",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
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

startServer();
