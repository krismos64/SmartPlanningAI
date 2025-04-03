const db = require("../config/db");

async function up() {
  try {
    console.log("Création de la table auth_logs...");

    // Créer la table auth_logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        status ENUM('success', 'failed') NOT NULL,
        message TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email),
        INDEX (ip_address),
        INDEX (status),
        INDEX (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Table auth_logs créée avec succès");
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création de la table auth_logs:",
      error
    );
    throw error;
  }
}

async function down() {
  try {
    console.log("Suppression de la table auth_logs...");

    // Supprimer la table auth_logs
    await db.query("DROP TABLE IF EXISTS auth_logs;");

    console.log("✅ Table auth_logs supprimée avec succès");
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression de la table auth_logs:",
      error
    );
    throw error;
  }
}

module.exports = {
  up,
  down,
  description:
    "Création de la table auth_logs pour journaliser les tentatives d'authentification",
};
