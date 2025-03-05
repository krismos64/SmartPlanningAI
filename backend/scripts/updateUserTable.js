const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const updateUserTable = async () => {
  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, "updateUserTable.sql");
    const sqlScript = fs.readFileSync(sqlFilePath, "utf8");

    // Créer une connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true, // Permettre l'exécution de plusieurs requêtes SQL
    });

    console.log("Connexion à la base de données établie");

    // Exécuter le script SQL
    console.log(
      "Exécution du script de mise à jour de la table utilisateur..."
    );
    await connection.query(sqlScript);

    console.log("Mise à jour de la table utilisateur terminée avec succès");

    // Fermer la connexion
    await connection.end();

    process.exit(0);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la table utilisateur:",
      error
    );
    process.exit(1);
  }
};

updateUserTable();
