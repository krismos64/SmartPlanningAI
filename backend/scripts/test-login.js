const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function testLogin() {
  try {
    console.log("🔍 Test de connexion pour admin@admin.fr");

    // Récupérer l'utilisateur
    const user = await User.findByEmail("admin@admin.fr");
    console.log("\n👤 Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordHash: user.password,
    });

    // Tester le mot de passe
    const password = "admin";
    console.log("\n🔐 Test du mot de passe:", password);

    // Vérifier si le mot de passe est au format bcrypt
    const isBcrypt =
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    console.log("Format bcrypt:", isBcrypt);

    // Comparer les mots de passe
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Correspondance du mot de passe:", isMatch);

    // Tester la méthode comparePassword
    const isMatchMethod = await user.comparePassword(password);
    console.log("Correspondance via comparePassword:", isMatchMethod);
  } catch (error) {
    console.error("❌ Erreur lors du test de connexion:", error);
    console.error("Stack trace:", error.stack);
  }
}

testLogin();
