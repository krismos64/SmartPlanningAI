// config/db.js
const mysql = require("mysql2");
require("dotenv").config();

// Afficher les variables d'environnement de la base de données (sans les mots de passe)
console.log("Variables d'environnement de la base de données:");
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_NAME:", process.env.DB_NAME);

// Configuration du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 10 : 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "+00:00",
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
        }
      : false,
});

// Tester la connexion au démarrage
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données:", err.message);
    process.exit(1);
  }

  console.log("✅ Connexion à la base de données établie avec succès");
  console.log(
    `📊 Base de données: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`
  );

  // Vérifier que la base est bien sélectionnée
  connection.query("SELECT DATABASE() as db", (err, results) => {
    if (err) {
      console.error(
        "❌ Erreur lors de la vérification de la base de données:",
        err
      );
      process.exit(1);
    }
    console.log(
      "✅ Connexion à la base de données MySQL réussie (Base sélectionnée:",
      results[0].db + ")"
    );
    console.log("Base de données sélectionnée:", results[0].db);
    connection.release();
  });
});

// Gérer les erreurs de pool
pool.on("error", (err) => {
  console.error("Erreur du pool de connexions:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error(
      "Connexion à la base de données perdue. Redémarrage du serveur..."
    );
    process.exit(1);
  }
});

// Exporter le pool avec promesses
module.exports = pool.promise();
