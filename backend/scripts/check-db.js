const connectDB = require("../config/db");

async function checkDatabase() {
  try {
    const connection = await connectDB();

    // Vérifier la structure de la table users
    console.log("\n📊 Structure de la table users:");
    const [tableInfo] = await connection.query("DESCRIBE users");
    console.log(tableInfo);

    // Vérifier les utilisateurs existants
    console.log("\n👥 Utilisateurs existants:");
    const [users] = await connection.query("SELECT * FROM users");
    console.log(users);

    // Vérifier les contraintes de la table
    console.log("\n🔒 Contraintes de la table users:");
    const [constraints] = await connection.query(`
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
            AND TABLE_NAME = 'users'
        `);
    console.log(constraints);

    // Fermer la connexion
    await connection.end();
  } catch (error) {
    console.error(
      "❌ Erreur lors de la vérification de la base de données:",
      error
    );
  }
}

checkDatabase();
