const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testPasswordVerification() {
  console.log("🔍 Test de vérification de mot de passe");

  try {
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connexion à la base de données MySQL réussie");

    // Récupérer l'utilisateur admin
    const email = "admin@admin.fr";
    const testPassword = "admin"; // Mot de passe à tester

    console.log(`\n🔍 Récupération de l'utilisateur avec l'email: ${email}`);
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`);
      await connection.end();
      return;
    }

    const user = users[0];
    console.log("✅ Utilisateur trouvé:");
    console.log("- ID:", user.id);
    console.log("- Email:", user.email);
    console.log("- Mot de passe haché:", user.password);

    // Vérifier si le mot de passe est au format bcrypt
    const isBcrypt =
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    console.log("- Format bcrypt:", isBcrypt ? "Oui" : "Non");

    if (!isBcrypt) {
      console.log("❌ Le mot de passe stocké n'est pas au format bcrypt");
      await connection.end();
      return;
    }

    // Test de vérification directe avec bcrypt
    console.log(
      `\n🔍 Test de vérification du mot de passe "${testPassword}" avec bcrypt.compare`
    );
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(
        "✅ Résultat de la comparaison:",
        isMatch ? "Succès" : "Échec"
      );
    } catch (bcryptError) {
      console.error("❌ Erreur bcrypt:", bcryptError);
      console.error("Stack trace:", bcryptError.stack);
    }

    // Test de génération d'un nouveau hash pour comparaison
    console.log(
      "\n🔍 Test de génération d'un nouveau hash pour le même mot de passe"
    );
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log("- Nouveau hash généré:", newHash);

    // Comparer les deux hashs (ils devraient être différents mais vérifier avec le même mot de passe)
    console.log(
      "\n🔍 Comparaison du nouveau hash avec le mot de passe original"
    );
    const isNewHashMatch = await bcrypt.compare(testPassword, newHash);
    console.log(
      "✅ Résultat de la comparaison avec le nouveau hash:",
      isNewHashMatch ? "Succès" : "Échec"
    );

    await connection.end();
  } catch (err) {
    console.error("❌ Erreur lors du test de vérification:", err);
    console.error("Stack trace:", err.stack);
  }
}

testPasswordVerification();
