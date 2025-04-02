const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
require("dotenv").config();

// Configuration
const API_URL = "http://localhost:5001/api"; // Correction du port et du chemin de l'API
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  try {
    console.log("Création d'un utilisateur de test...");

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("TestPassword123", salt);

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connectDB.execute(
      "SELECT * FROM users WHERE email = ?",
      ["test-password-change@example.com"]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`Utilisateur de test existant trouvé avec l'ID: ${userId}`);

      // Mettre à jour le mot de passe
      await connectDB.execute("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);
      console.log("Mot de passe de l'utilisateur de test réinitialisé");
    } else {
      // Créer un nouvel utilisateur
      const [result] = await connectDB.execute(
        "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
        [
          "test-password-change@example.com",
          hashedPassword,
          "Test",
          "User",
          "admin",
        ]
      );
      userId = result.insertId;
      console.log(`Nouvel utilisateur de test créé avec l'ID: ${userId}`);
    }

    return {
      id: userId,
      email: "test-password-change@example.com",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'utilisateur de test:",
      error
    );
    throw error;
  }
}

// Fonction pour générer un token JWT
function generateToken(user) {
  // Obtenir la date actuelle en secondes
  const now = Math.floor(Date.now() / 1000);

  // Générer un identifiant unique pour le token (jti)
  const tokenId = require("crypto").randomBytes(16).toString("hex");

  return jwt.sign(
    {
      userId: user.id.toString(), // Assurer que userId est une chaîne
      role: "admin",
      iat: now, // Issued at (date d'émission)
      nbf: now, // Not before (pas valide avant)
      jti: tokenId, // JWT ID (identifiant unique)
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Fonction pour tester le changement de mot de passe
async function testPasswordChange(user, token) {
  try {
    console.log("\n=== Test de changement de mot de passe ===");

    // 1. Test avec des données valides
    console.log("\n1. Test avec des données valides:");
    try {
      const response = await axios.post(
        `${API_URL}/direct-password-test`,
        {
          currentPassword: "TestPassword123",
          newPassword: "NewPassword456",
          confirmPassword: "NewPassword456",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Succès:", response.data);

      // Vérifier que le mot de passe a été changé en base de données
      const [rows] = await connectDB.execute(
        "SELECT password, password_updated_at FROM users WHERE id = ?",
        [user.id]
      );

      if (rows.length > 0) {
        const isValid = await bcrypt.compare(
          "NewPassword456",
          rows[0].password
        );
        console.log(
          `🔐 Vérification BD: Le nouveau mot de passe est ${
            isValid ? "valide" : "invalide"
          }`
        );
        console.log(`📅 Date de mise à jour: ${rows[0].password_updated_at}`);
      }

      // Vérifier que l'activité a été enregistrée
      const [activities] = await connectDB.execute(
        "SELECT * FROM activities WHERE user_id = ? AND type = ? ORDER BY timestamp DESC LIMIT 1",
        [user.id, "security"]
      );

      if (activities.length > 0) {
        console.log("📝 Activité enregistrée:", {
          id: activities[0].id,
          type: activities[0].type,
          entity_type: activities[0].entity_type,
          description: activities[0].description,
          timestamp: activities[0].timestamp,
        });
      } else {
        console.log("❌ Aucune activité enregistrée");
      }
    } catch (error) {
      console.error(
        "❌ Erreur:",
        error.response ? error.response.data : error.message
      );
    }

    // 2. Test avec un mot de passe actuel incorrect
    console.log("\n2. Test avec un mot de passe actuel incorrect:");
    try {
      const response = await axios.post(
        `${API_URL}/direct-password-test`,
        {
          currentPassword: "WrongPassword",
          newPassword: "AnotherPassword789",
          confirmPassword: "AnotherPassword789",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Réponse inattendue:", response.data);
    } catch (error) {
      console.log(
        "✅ Erreur attendue:",
        error.response ? error.response.data : error.message
      );
    }

    // 3. Test avec un mot de passe faible
    console.log("\n3. Test avec un mot de passe faible:");
    try {
      const response = await axios.post(
        `${API_URL}/direct-password-test`,
        {
          currentPassword: "NewPassword456",
          newPassword: "weak",
          confirmPassword: "weak",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Réponse inattendue:", response.data);
    } catch (error) {
      console.log(
        "✅ Erreur attendue:",
        error.response ? error.response.data : error.message
      );
    }

    // 4. Test avec des mots de passe qui ne correspondent pas
    console.log("\n4. Test avec des mots de passe qui ne correspondent pas:");
    try {
      const response = await axios.post(
        `${API_URL}/direct-password-test`,
        {
          currentPassword: "NewPassword456",
          newPassword: "NewPassword789",
          confirmPassword: "DifferentPassword",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Réponse inattendue:", response.data);
    } catch (error) {
      console.log(
        "✅ Erreur attendue:",
        error.response ? error.response.data : error.message
      );
    }

    console.log("\n=== Fin des tests ===");
  } catch (error) {
    console.error("Erreur générale lors des tests:", error);
  }
}

// Fonction principale
async function main() {
  try {
    console.log("Démarrage des tests de changement de mot de passe...");

    // Créer un utilisateur de test
    const user = await createTestUser();

    // Générer un token JWT
    const token = generateToken(user);

    // Tester le changement de mot de passe
    await testPasswordChange(user, token);

    console.log("Tests terminés.");
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
}

// Exécuter le programme
main();
