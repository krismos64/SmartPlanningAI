/**
 * Simple script de test pour changer le mot de passe d'un utilisateur directement
 */
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "SmartPlanningAI",
};

async function main() {
  let connection;
  try {
    console.log("Connexion à la base de données...");
    connection = await mysql.createConnection(dbConfig);
    console.log("Connecté à la base de données.");

    // 1. Création ou mise à jour d'un utilisateur de test
    const testEmail = "test-password-change@example.com";

    // Vérifier si l'utilisateur existe
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [testEmail]
    );

    let userId;
    // Hasher le mot de passe initial
    const salt = await bcrypt.genSalt(10);
    const initialPassword = await bcrypt.hash("TestPassword123", salt);

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`Utilisateur de test trouvé avec l'ID ${userId}`);

      // Réinitialiser le mot de passe
      await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
        initialPassword,
        userId,
      ]);
      console.log('Mot de passe réinitialisé à "TestPassword123"');
    } else {
      // Créer un nouvel utilisateur
      const [result] = await connection.execute(
        "INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        [testEmail, initialPassword, "Test", "User", "admin"]
      );
      userId = result.insertId;
      console.log(`Nouvel utilisateur créé avec l'ID ${userId}`);
    }

    // 2. Changer le mot de passe
    console.log("\nTest de changement de mot de passe:");

    // a. Vérifier le mot de passe actuel
    const [user] = await connection.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    const currentPassword = "TestPassword123";
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user[0].password
    );
    console.log(`Mot de passe actuel valide: ${isCurrentPasswordValid}`);

    if (!isCurrentPasswordValid) {
      console.error("Le mot de passe actuel est invalide.");
      return;
    }

    // b. Hasher et enregistrer le nouveau mot de passe
    const newPassword = "NewPassword456";
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await connection.execute(
      "UPDATE users SET password = ?, password_updated_at = NOW() WHERE id = ?",
      [newHashedPassword, userId]
    );
    console.log("Mot de passe mis à jour avec succès");

    // c. Vérifier que le nouveau mot de passe fonctionne
    const [updatedUser] = await connection.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    const isNewPasswordValid = await bcrypt.compare(
      newPassword,
      updatedUser[0].password
    );
    console.log(`Nouveau mot de passe valide: ${isNewPasswordValid}`);

    // d. Enregistrer l'activité
    try {
      await connection.execute(
        `INSERT INTO activities (
          type, 
          entity_type, 
          entity_id, 
          description, 
          user_id, 
          details
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "security",
          "user",
          userId.toString(),
          "Mot de passe modifié (test direct)",
          userId,
          JSON.stringify({
            action: "password_change_test",
            timestamp: new Date(),
          }),
        ]
      );
      console.log("Activité enregistrée avec succès");
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        error.message
      );
    }

    console.log("\nTest terminé avec succès!");
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Connexion fermée");
    }
  }
}

main();
