const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");

const initDatabase = async () => {
  try {
    // Créer une connexion sans sélectionner de base de données
    const connection = await connectDB();

    console.log("Connecté à MySQL");

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, "initDatabase.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Exécuter les requêtes SQL
    const statements = sql.split(";").filter((statement) => statement.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log("Requête exécutée avec succès");
      }
    }

    console.log("Base de données initialisée avec succès");
    await connection.end();
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
};

initDatabase();
