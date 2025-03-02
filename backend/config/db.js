// config/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connexion à la base de données MySQL réussie");
    return connection;
  } catch (err) {
    console.error("❌ Erreur de connexion à MySQL:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
