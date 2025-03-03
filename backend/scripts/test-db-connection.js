const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testConnection() {
  console.log("🔍 Test de connexion à la base de données");
  console.log("Variables d'environnement :");
  console.log("- DB_HOST:", process.env.DB_HOST);
  console.log("- DB_USER:", process.env.DB_USER);
  console.log("- DB_NAME:", process.env.DB_NAME);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connexion à la base de données MySQL réussie");

    // Tester la récupération d'un utilisateur
    console.log("\n🔍 Test de récupération d'un utilisateur");
    const [users] = await connection.execute("SELECT * FROM users LIMIT 1");

    if (users.length > 0) {
      const user = users[0];
      console.log("✅ Utilisateur trouvé :");
      console.log("- ID:", user.id);
      console.log("- Email:", user.email);
      console.log("- Rôle:", user.role);
      console.log("- Mot de passe (haché):", user.password);

      // Tester la récupération par email
      console.log("\n🔍 Test de récupération par email");
      const email = "admin@admin.fr";
      const [usersByEmail] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (usersByEmail.length > 0) {
        console.log(`✅ Utilisateur avec l'email ${email} trouvé`);
      } else {
        console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`);
      }
    } else {
      console.log("❌ Aucun utilisateur trouvé dans la base de données");
    }

    await connection.end();
  } catch (err) {
    console.error("❌ Erreur lors du test de connexion :", err);
    console.error("Stack trace:", err.stack);
  }
}

testConnection();
