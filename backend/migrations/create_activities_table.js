const db = require("../config/db");

/**
 * Crée la table des activités dans la base de données
 */
async function createActivitiesTable() {
  try {
    console.log("Création de la table activities...");

    // Vérifier si la table existe déjà
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'activities'
    `);

    if (tables.length > 0) {
      console.log("La table activities existe déjà.");
      return;
    }

    // Créer la table activities
    await db.query(`
      CREATE TABLE activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL COMMENT 'Type d''action: create, update, delete, login, logout, approve, reject, etc.',
        entity_type VARCHAR(50) NOT NULL COMMENT 'Type d''entité concernée: employee, schedule, vacation, user, etc.',
        entity_id VARCHAR(50) DEFAULT NULL COMMENT 'ID de l''entité concernée',
        description VARCHAR(255) NOT NULL COMMENT 'Description de l''action effectuée',
        user_id INT DEFAULT NULL COMMENT 'ID de l''utilisateur qui a effectué l''action',
        ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Adresse IP de l''utilisateur',
        user_agent TEXT DEFAULT NULL COMMENT 'User-Agent du navigateur',
        details JSON DEFAULT NULL COMMENT 'Détails supplémentaires au format JSON',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure de l''action',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Table activities créée avec succès.");

    // Créer des index pour améliorer les performances des requêtes
    await db.query(`
      CREATE INDEX idx_activities_type ON activities(type);
    `);
    console.log("Index sur le type créé avec succès.");

    await db.query(`
      CREATE INDEX idx_activities_entity_type ON activities(entity_type);
    `);
    console.log("Index sur le type d'entité créé avec succès.");

    await db.query(`
      CREATE INDEX idx_activities_entity_id ON activities(entity_id);
    `);
    console.log("Index sur l'ID d'entité créé avec succès.");

    await db.query(`
      CREATE INDEX idx_activities_user_id ON activities(user_id);
    `);
    console.log("Index sur l'ID utilisateur créé avec succès.");

    await db.query(`
      CREATE INDEX idx_activities_timestamp ON activities(timestamp);
    `);
    console.log("Index sur le timestamp créé avec succès.");
  } catch (error) {
    console.error("Erreur lors de la création de la table activities:", error);
    throw error;
  }
}

// Exécuter la migration si ce script est appelé directement
if (require.main === module) {
  createActivitiesTable()
    .then(() => {
      console.log("Migration terminée avec succès.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur lors de la migration:", error);
      process.exit(1);
    });
}

module.exports = { createActivitiesTable };
