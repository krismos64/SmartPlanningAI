const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

async function createShiftsTable() {
  let connection;
  try {
    console.log("Création/mise à jour de la table shifts...");

    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, "create_shifts_table.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    // Diviser le fichier en instructions SQL individuelles
    const sqlStatements = sql
      .replace(/--.*$/gm, "") // Supprimer les commentaires
      .split(";")
      .filter((statement) => statement.trim() !== "");

    // Créer une connexion à la base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "SmartPlanningAI",
      multipleStatements: true,
    });

    // Exécuter chaque instruction SQL
    for (const statement of sqlStatements) {
      if (statement.trim() === "") continue;

      // Ignorer la commande USE car nous avons déjà spécifié la base de données dans la connexion
      if (statement.trim().toUpperCase().startsWith("USE ")) {
        console.log("Ignoré:", statement.trim());
        continue;
      }

      try {
        await connection.query(statement);
        console.log("Exécuté avec succès:", statement.substring(0, 50) + "...");
      } catch (err) {
        // Ignorer les erreurs liées aux contraintes qui existent déjà
        if (
          !err.message.includes("Duplicate key name") &&
          !err.message.includes("Multiple primary key defined") &&
          !err.message.includes("already exists")
        ) {
          console.error("Erreur SQL:", err.message);
          console.error("Dans la requête:", statement);
          throw err;
        }
        console.warn(`Avertissement: ${err.message}`);
      }
    }

    console.log("Table shifts créée/mise à jour avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour de la table shifts:",
      error
    );
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter la migration si ce script est appelé directement
if (require.main === module) {
  createShiftsTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createShiftsTable };
