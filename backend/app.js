const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const routes = require("./routes");
const { NlpManager } = require("node-nlp");
const { changePassword } = require("./controllers/usersController");

dotenv.config();

const app = express();

// Configuration du proxy et CORS
app.set("trust proxy", 1);
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// 📦 Routes API
app.use("/api", routes);

// ✅ Route ping
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "API en ligne" });
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
    const [result] = await connectDB.execute("SELECT 1");
    if (result) {
      console.log("🔌 Connexion à la base de données établie avec succès");
    }

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

    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
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

initializeServer();
module.exports = app;
