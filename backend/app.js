// Charger les variables d'environnement en premier
const path = require("path");
const dotenv = require("dotenv");

// Charger les variables d'environnement selon l'environnement
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

console.log(`🔧 Chargement des variables d'environnement depuis ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Afficher les variables d'environnement de la base de données pour débogage
console.log("Variables d'environnement de la base de données:");
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_NAME:", process.env.DB_NAME);

// Ensuite, charger les autres dépendances
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const cookieParser = require("cookie-parser");
const { NlpManager } = require("node-nlp");
const { changePassword } = require("./controllers/usersController");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");

// Maintenant on peut charger les routes
const csrfRoutes = require("./routes/csrf");

// Importer la stratégie Google
require("./auth/google");

const app = express();

// Configuration du proxy pour gérer les en-têtes X-Forwarded-For
app.set("trust proxy", 1);

// Configuration CORS
const corsOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://smartplanning.fr", "https://www.smartplanning.fr"]
    : [
        "https://smartplanning.fr",
        "https://www.smartplanning.fr",
        "http://localhost:3000",
      ];

app.use(
  cors({
    origin: "https://smartplanning.fr",
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Configuration pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

// 📂 Logs
const logDirectory = path.join(__dirname, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});
app.use(morgan("combined", { stream: accessLogStream }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Configuration de la session Express
app.use(
  session({
    secret: process.env.JWT_SECRET || "smartplanningai_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Sécurisé uniquement en production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  })
);

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// 📦 Routes CSRF
app.use("/api/csrf", csrfRoutes);

// Route CSRF token
app.get("/api/csrf-token", (req, res) => {
  if (csrfRoutes.handle) {
    return csrfRoutes.handle(req, res);
  }
  res
    .status(500)
    .json({ success: false, message: "CSRF handler not available" });
});

// Importer les routes individuelles au lieu du module complet
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contact", require("./routes/contact"));

// Routes protégées
const { auth } = require("./middleware/auth");
app.use("/api/employees", auth, require("./routes/employees"));
app.use("/api/departments", auth, require("./routes/departments"));
app.use("/api/planning", auth, require("./routes/shifts"));
app.use("/api/vacations", auth, require("./routes/vacations"));
app.use("/api/weekly-schedules", auth, require("./routes/weeklySchedules"));
app.use("/api/schedule", auth, require("./routes/autoSchedule"));
app.use("/api/stats", auth, require("./routes/stats"));
app.use("/api/schedule-stats", auth, require("./routes/scheduleStats"));
app.use("/api/users", auth, require("./routes/users"));
app.use("/api/hour-balance", auth, require("./routes/hourBalance"));
app.use("/api/work-hours", auth, require("./routes/workHoursRoutes"));
app.use("/api/activities", auth, require("./routes/activities"));
app.use("/api/notifications", auth, require("./routes/notifications"));

// Essayer de charger les autres routes
try {
  const chatbotRoutes = require("./routes/chatbotRoutes");
  if (typeof chatbotRoutes === "function" || chatbotRoutes.stack) {
    app.use("/api/chatbot", auth, chatbotRoutes);
  } else {
    console.warn("⚠️ Le module chatbotRoutes n'est pas un middleware valide");
  }
} catch (error) {
  console.warn(
    "⚠️ Impossible de charger le module chatbotRoutes:",
    error.message
  );
}

try {
  const adminRoutes = require("./routes/admin");
  if (typeof adminRoutes === "function" || adminRoutes.stack) {
    app.use("/api/admin", auth, adminRoutes);
  } else {
    console.warn("⚠️ Le module adminRoutes n'est pas un middleware valide");
  }
} catch (error) {
  console.warn(
    "⚠️ Impossible de charger le module adminRoutes:",
    error.message
  );
}

// ✅ Route ping
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "API en ligne" });
});

// ✅ Route ping API
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// Route de test pour le changement de mot de passe
app.post("/api/test/password", (req, res) => {
  console.log("Route de test password appelée");
  console.log("Requête:", {
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? "Present" : "Missing",
      contentType: req.headers["content-type"],
    },
  });
  try {
    return changePassword(req, res);
  } catch (error) {
    console.error("Erreur dans la route de test:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ❌ Route non trouvée
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// ❗ Middleware d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur serveur",
  });
});

// 🌐 NLP global
global.nlpManager = null;

// 🧭 Log toutes les routes
function logRoutes(router, basePath = "") {
  const routes = [];
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = basePath + middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter((method) => middleware.route.methods[method])
        .map((method) => method.toUpperCase());
      methods.forEach((method) => routes.push(`${method} ${path}`));
    } else if (middleware.name === "router") {
      const routerBasePath =
        basePath +
        (middleware.regexp.source === "^\\/?(?=\\/|$)"
          ? ""
          : middleware.regexp.source
              .replace(/\\\//g, "/")
              .replace(/\(\?:\\\/\?\)/, "")
              .replace(/\^/g, "")
              .replace(/\$/, ""));
      logRoutes(middleware.handle, routerBasePath).forEach((route) =>
        routes.push(route)
      );
    } else if (middleware.name === "bound dispatch") {
      const newRoute = logRoutes(middleware.handle, basePath + middleware.path);
      newRoute.forEach((route) => routes.push(route));
    }
  });
  return routes;
}

// 🚀 Initialisation du serveur
async function initializeServer() {
  try {
    const connectDB = require("./config/db");
    // La connexion est déjà testée dans db.js, pas besoin de refaire un test ici
    console.log("🔌 Connexion à la base de données établie avec succès");

    try {
      const nlpManager = new NlpManager({ languages: ["fr"] });
      if (fs.existsSync("./model.nlp")) {
        await nlpManager.load("./model.nlp");
        console.log("✓ Modèle NLP chargé avec succès");
        global.nlpManager = nlpManager;
      } else {
        console.log(
          "ℹ Aucun modèle NLP trouvé, le système de règles sera utilisé"
        );
      }
    } catch (nlpError) {
      console.warn(
        "⚠ Impossible d'initialiser le NLP, le système de règles sera utilisé:",
        nlpError.message
      );
    }

    // Utiliser explicitement le port 5001 (ou celui défini dans les variables d'environnement)
    const PORT = process.env.PORT || 5001;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Backend lancé sur http://0.0.0.0:${PORT}`);
      console.log(`📝 Mode : ${process.env.NODE_ENV || "production"}`);
      console.log(`🌐 API accessible à http://localhost:${PORT}/api`);

      console.log("\n📋 Routes disponibles dans l'API:");
      const apiRoutesLogger = logRoutes(app._router);
      const groupedRoutes = {};
      apiRoutesLogger.forEach((route) => {
        const pathSegments = route.split(" ")[1].split("/");
        const baseEndpoint = pathSegments[1] || "root";
        if (!groupedRoutes[baseEndpoint]) {
          groupedRoutes[baseEndpoint] = [];
        }
        groupedRoutes[baseEndpoint].push(route);
      });
      Object.keys(groupedRoutes)
        .sort()
        .forEach((endpoint) => {
          console.log(`\n🔹 ${endpoint.toUpperCase()}:`);
          groupedRoutes[endpoint].forEach((route) => {
            console.log(`  ${route}`);
          });
        });
      console.log("\n");
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du serveur:", error);
    process.exit(1);
  }
}

// Servir le favicon.ico
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "public", "favicon.ico"))
);

initializeServer();
module.exports = app;
