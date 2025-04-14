// Test de connexion à la base de données MySQL
require("dotenv").config({ path: "./.env.development" });
const mysql = require("mysql2/promise");

console.log("Variables d'environnement de la base de données:");
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log(
  "- DB_PASSWORD:",
  process.env.DB_PASSWORD ? "****" : "<non défini>"
);
console.log("- DB_NAME:", process.env.DB_NAME);
console.log("- DB_PORT:", process.env.DB_PORT);

async function testConnection() {
  try {
    // Configuration de la connexion
    const config = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
      // Pas de base de données spécifiée pour vérifier d'abord la connexion
    };

    console.log("\nTentative de connexion à MySQL avec la configuration:");
    console.log(
      JSON.stringify(
        {
          ...config,
          password: config.password ? "****" : "<non défini>",
        },
        null,
        2
      )
    );

    // Connexion à MySQL sans spécifier de base de données
    const connection = await mysql.createConnection(config);
    console.log("✅ Connexion à MySQL réussie!");

    // Vérifier si la base de données existe
    const dbName = process.env.DB_NAME || "smartplanningai";
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${dbName}'`
    );

    if (databases.length > 0) {
      console.log(`\n✅ La base de données '${dbName}' existe.`);

      // Sélectionner la base de données
      await connection.query(`USE ${dbName}`);

      // Afficher les tables
      const [tables] = await connection.query("SHOW TABLES");
      console.log(`\nTables dans la base de données '${dbName}':`);

      if (tables.length > 0) {
        tables.forEach((table) => {
          const tableName = Object.values(table)[0];
          console.log(` - ${tableName}`);
        });
      } else {
        console.log("Aucune table trouvée.");
      }
    } else {
      console.log(`\n❌ La base de données '${dbName}' n'existe pas.`);
      console.log("Création de la base de données...");

      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`✅ Base de données '${dbName}' créée avec succès.`);
    }

    // Fermer la connexion
    await connection.end();
    console.log("\nConnexion fermée.");

    return true;
  } catch (error) {
    console.error("\n❌ ERREUR DE CONNEXION:");
    console.error(error);
    return false;
  }
}

testConnection().then((success) => {
  if (success) {
    console.log("\n✅ TEST DE CONNEXION RÉUSSI");
  } else {
    console.log("\n❌ TEST DE CONNEXION ÉCHOUÉ");
  }
});
