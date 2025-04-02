const connectDB = require("../config/db");

async function up() {
  try {
    // Ajout du champ password_updated_at à la table users
    await connectDB.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP NULL DEFAULT NULL
    `);

    // Création de la table activities si elle n'existe pas
    await connectDB.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Migration réussie : Ajout du tracking des mots de passe");
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    throw error;
  }
}

async function down() {
  try {
    // Suppression du champ password_updated_at
    await connectDB.execute(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS password_updated_at
    `);

    // Suppression de la table activities
    await connectDB.execute(`
      DROP TABLE IF EXISTS activities
    `);

    console.log("Rollback réussi : Suppression du tracking des mots de passe");
  } catch (error) {
    console.error("Erreur lors du rollback:", error);
    throw error;
  }
}

module.exports = { up, down };

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  up()
    .then(() => {
      console.log("Migration exécutée avec succès.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erreur lors de l'exécution de la migration:", err);
      process.exit(1);
    });
}
