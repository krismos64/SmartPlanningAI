const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

async function executeMigration() {
  let connection;

  try {
    // Créer une connexion sans sélectionner de base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log("📦 Début de la migration...");

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, "..", "migrations", "init.sql");
    const sqlContent = await fs.readFile(sqlPath, "utf8");

    // Diviser le contenu en requêtes individuelles
    const queries = sqlContent
      .split(";")
      .filter((query) => query.trim().length > 0);

    // Exécuter chaque requête
    for (const query of queries) {
      await connection.query(query);
      console.log("✅ Requête exécutée avec succès");
    }

    console.log("✨ Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter la migration
executeMigration();
