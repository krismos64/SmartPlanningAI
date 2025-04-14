// config/db.js
const mysql = require("mysql2/promise");

// Chargement des variables d'environnement directement depuis le fichier .env correspondant
require("dotenv").config({
  path: require("path").resolve(
    __dirname,
    "../",
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development"
  ),
});

// Afficher les variables d'environnement de la base de données (sans les mots de passe)
console.log("Variables d'environnement de la base de données:");
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_NAME:", process.env.DB_NAME);

// Options de connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// En production, ajouter des options SSL seulement si on est sur le serveur distant
if (
  process.env.NODE_ENV === "production" &&
  process.env.DB_HOST !== "localhost"
) {
  console.log("🔒 Configuration SSL pour la base de données de production");
  dbConfig.ssl = {
    rejectUnauthorized: true,
  };
} else if (process.env.NODE_ENV === "production") {
  console.log("🔓 Mode production avec base locale : SSL désactivé");
}

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      "✅ Connexion à la base de données MySQL réussie (Base sélectionnée: " +
        process.env.DB_NAME +
        ")"
    );
    connection.release();
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur de connexion à la base de données:",
      error.message
    );
    throw error;
  }
};

// Tester la connexion immédiatement
testConnection().catch((err) => {
  console.error("Erreur lors du test de connexion initial:", err);
  // Ne pas quitter le processus pour permettre au serveur de démarrer quand même
});

console.log(
  "📊 Base de données:",
  process.env.DB_NAME,
  "sur",
  process.env.DB_HOST
);

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

module.exports = pool;
