const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config({ path: "../.env" });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "SmartPlanningAI",
};

async function debugAuth() {
  let connection;

  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    console.log("✅ Connexion à la base de données réussie");

    // Vérifier si l'utilisateur admin existe
    const [adminUsers] = await connection.query(
      "SELECT * FROM users WHERE email = 'admin@admin.fr'"
    );

    if (adminUsers.length === 0) {
      console.log("❌ L'utilisateur admin n'existe pas");
    } else {
      console.log("✅ L'utilisateur admin existe");
      console.log("Informations de l'utilisateur admin :", adminUsers[0]);

      // Tester le mot de passe
      const isMatch = await bcrypt.compare("admin", adminUsers[0].password);
      console.log(
        "Test du mot de passe 'admin' :",
        isMatch ? "✅ Correct" : "❌ Incorrect"
      );
    }

    // Vérifier la structure de la table users
    const [usersColumns] = await connection.query("SHOW COLUMNS FROM users");
    console.log("Structure de la table users :");
    usersColumns.forEach((column) => {
      console.log(`- ${column.Field} (${column.Type})`);
    });

    // Simuler la route de connexion
    console.log("\nSimulation de la route de connexion :");
    const email = "admin@admin.fr";
    const password = "admin";

    // Vérifier si l'utilisateur existe
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log("❌ Utilisateur non trouvé");
      return;
    }

    const user = users[0];
    console.log("✅ Utilisateur trouvé :", user);

    // Vérifier le mot de passe
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(
        "Comparaison du mot de passe :",
        isMatch ? "✅ Correct" : "❌ Incorrect"
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors de la comparaison du mot de passe :",
        error
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors du débogage :", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("✅ Connexion à la base de données fermée");
    }
  }
}

// Exécuter le débogage
debugAuth();
