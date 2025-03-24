// config/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

// Afficher les variables d'environnement de la base de données
console.log("Variables d'environnement de la base de données:");
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_NAME:", process.env.DB_NAME);

// Créer un pool de connexions pour une meilleure gestion
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smartplanningai",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
  try {
    // Vérifier si le nom de la base de données est défini
    if (!process.env.DB_NAME) {
      throw new Error("La variable d'environnement DB_NAME n'est pas définie");
    }

    // Obtenir une connexion du pool
    const connection = await pool.getConnection();

    // Vérifier que la base de données est bien sélectionnée
    const [result] = await connection.query("SELECT DATABASE() as db");
    const selectedDB = result[0].db;

    console.log(
      `✅ Connexion à la base de données MySQL réussie (Base sélectionnée: ${selectedDB})`
    );
    console.log(`Base de données sélectionnée: ${selectedDB}`);

    // Libérer la connexion pour qu'elle retourne au pool
    connection.release();
  } catch (err) {
    console.error("❌ Erreur de connexion à MySQL:", err.message);
    console.error("Stack trace:", err.stack);
  }
};

// Tester la connexion au démarrage
testConnection();

// Exporter directement le pool pour les requêtes
module.exports = pool;
