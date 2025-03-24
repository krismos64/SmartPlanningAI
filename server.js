const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();

// Import des routes
const authRoutes = require("./backend/routes/auth");

const app = express();
const port = process.env.BACKEND_PORT || 5001;

// Configuration CORS
app.use(
  cors({
    origin: process.env.REACT_APP_FRONTEND_URL || "http://localhost:5005",
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
app.use(cookieParser());

// Configuration de la session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Configuration CSRF simplifiée
const csrfProtection = csrf({ cookie: true });

// Route pour obtenir le token CSRF (sans protection CSRF)
app.get("/api/csrf-token", (req, res) => {
  // Générer un nouveau token CSRF
  const token = req.csrfToken ? req.csrfToken() : "default-token";

  console.log("CSRF Token généré:", token);

  // Définir le cookie CSRF
  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.json({ csrfToken: token });
});

// Routes d'authentification
app.use("/api/auth", csrfProtection, authRoutes);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === "POST") {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
  }
  next();
});

// Gestion des erreurs CSRF
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.error("Erreur CSRF:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      cookies: req.cookies,
    });
    return res.status(403).json({
      error: "Token CSRF invalide",
      message: "Veuillez rafraîchir la page",
    });
  }
  next(err);
});

// Configuration MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "smartplanningai",
  port: 3306,
};

// Pool de connexions MySQL
const pool = mysql.createPool(dbConfig);

// Test de connexion à la base de données
pool
  .getConnection()
  .then((connection) => {
    console.log("Connexion MySQL établie avec succès");
    connection.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion MySQL:", err);
  });

// Routes pour le chatbot
app.get("/api/chatbot/absences/today", async (req, res) => {
  try {
    console.log("Récupération des absences du jour");
    const [rows] = await pool.query(`
      SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as name,
        CASE 
          WHEN e.status = 'vacation' THEN 'En congés'
          WHEN e.status = 'sick' THEN 'Malade'
          ELSE e.status
        END as reason
      FROM employees e
      WHERE e.status IN ('vacation', 'sick')
    `);

    console.log("Résultat absences:", rows);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erreur MySQL:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/api/chatbot/vacations/upcoming", async (req, res) => {
  try {
    console.log("Récupération des prochains congés");
    const [rows] = await pool.query(`
      SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as name,
        vr.start_date,
        vr.end_date
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      WHERE vr.status = 'approved'
      AND vr.start_date > CURDATE()
      ORDER BY vr.start_date ASC
      LIMIT 5
    `);

    console.log("Résultat congés:", rows);
    res.json({
      success: true,
      data: rows.map((row) => ({
        name: row.name,
        start_date: new Date(row.start_date).toLocaleDateString(),
        end_date: new Date(row.end_date).toLocaleDateString(),
      })),
    });
  } catch (error) {
    console.error("Erreur MySQL:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/api/chatbot/schedules/missing", async (req, res) => {
  try {
    console.log("Récupération des plannings manquants");
    const [rows] = await pool.query(`
      SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as name,
        DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%Y-%m-%d') as week
      FROM employees e
      LEFT JOIN weekly_schedules ws ON e.id = ws.employee_id
      AND ws.week_start = DATE(DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%Y-%m-%d'))
      WHERE ws.id IS NULL
      AND e.status = 'active'
    `);

    console.log("Résultat plannings:", rows);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erreur MySQL:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/api/chatbot/employees/negative-hours", async (req, res) => {
  try {
    console.log("Récupération des soldes négatifs");
    const [rows] = await pool.query(`
      SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as name,
        e.hour_balance as balance
      FROM employees e
      WHERE e.hour_balance < 0
      AND e.status = 'active'
    `);

    console.log("Résultat soldes:", rows);
    res.json({
      success: true,
      data: rows.map((row) => ({
        name: row.name,
        balance: parseFloat(row.balance).toFixed(2),
      })),
    });
  } catch (error) {
    console.error("Erreur MySQL:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route de test de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: port,
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`
=================================
🚀 Serveur démarré avec succès
---------------------------------
📡 Backend API: http://localhost:${port}
🌐 Frontend URL: ${process.env.REACT_APP_FRONTEND_URL}
=================================
  `);
});
