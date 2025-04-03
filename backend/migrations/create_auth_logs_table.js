const db = require("../config/db");

/**
 * Migration pour créer la table des logs d'authentification
 */
async function createAuthLogsTable() {
  try {
    console.log("Création de la table auth_logs...");

    // Vérifier si la table existe déjà
    const [tables] = await db.query("SHOW TABLES LIKE 'auth_logs'");

    if (tables.length === 0) {
      // Créer la table si elle n'existe pas
      await db.query(`
        CREATE TABLE auth_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          status ENUM('success', 'failed') NOT NULL,
          message VARCHAR(255),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_ip_address (ip_address),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log("✅ Table auth_logs créée avec succès");
    } else {
      console.log("ℹ️ La table auth_logs existe déjà");
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création de la table auth_logs:",
      error
    );
    throw error;
  }
}

// Exécuter la migration si ce script est appelé directement
if (require.main === module) {
  createAuthLogsTable()
    .then(() => {
      console.log("Migration terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur de migration:", error);
      process.exit(1);
    });
}

module.exports = { createAuthLogsTable };
