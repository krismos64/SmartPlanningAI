const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/auth");
const employeesRouter = require("./routes/employees");
const shiftsRouter = require("./routes/shifts");
const vacationsRouter = require("./routes/vacations");
const weeklySchedulesRouter = require("./routes/weeklySchedules");
const activitiesRouter = require("./routes/activities");
const departmentsRouter = require("./routes/departments");

const app = express();

// Middleware
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
console.log(`Configuration CORS: autorisation de l'origine ${frontendUrl}`);

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware de logging pour déboguer les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers));
  next();
});

// Middleware pour gérer les requêtes OPTIONS
app.options("*", (req, res) => {
  console.log(`Requête OPTIONS reçue pour ${req.path}`);
  res.status(200).end();
});

// Augmenter la limite de taille des requêtes pour permettre l'upload d'images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/shifts", shiftsRouter);
app.use("/api/vacations", vacationsRouter);
app.use("/api/weekly-schedules", weeklySchedulesRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/departments", departmentsRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur est survenue sur le serveur" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
