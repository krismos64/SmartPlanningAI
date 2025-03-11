const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "SmartPlanningAI",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Créer un pool de connexions
const pool = mysql.createPool(dbConfig);

// Tester la connexion au démarrage
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connexion à la base de données établie avec succès");
    console.log(
      `📊 Base de données: ${dbConfig.database} sur ${dbConfig.host}`
    );
    connection.release();
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
    process.exit(1);
  }
})();

// Fonction utilitaire pour exécuter des requêtes SQL
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête SQL:", error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
};
