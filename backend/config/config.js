/**
 * Configuration du backend SmartPlanning
 */

require("dotenv").config();

// Configuration générale
const config = {
  // Port du serveur
  port: process.env.PORT || 5000,

  // URL du frontend
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5001",

  // Base de données
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "smartplanning",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "smartplanningai_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  // CORS
  cors: {
    origins: [
      process.env.FRONTEND_URL || "http://localhost:5001",
      "http://localhost:3000",
      "http://localhost:5004",
      "http://localhost:5005",
      "http://localhost:5007",
    ],
  },
};

module.exports = config;
