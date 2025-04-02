const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");

// Fonction pour générer un token JWT de test
const generateTestToken = (user) => {
  const secretKey = process.env.JWT_SECRET || "jwt_secret_for_tests";
  return jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn: "1h",
  });
};

describe("POST /api/users/change-password", () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Création d'un utilisateur de test
    const hashedPassword = await bcrypt.hash("Test123!", 10);
    const [result] = await connectDB.execute(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      ["test@example.com", hashedPassword, "Test", "User"]
    );
    testUser = { id: result.insertId, email: "test@example.com" };

    // Génération du token JWT
    authToken = generateTestToken(testUser); // À implémenter selon votre système d'auth
  });

  afterAll(async () => {
    await connectDB.execute("DELETE FROM users WHERE id = ?", [testUser.id]);
  });

  it("devrait changer le mot de passe avec succès", async () => {
    const response = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "Test123!",
        newPassword: "NewTest123!",
        confirmPassword: "NewTest123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Mot de passe mis à jour avec succès");

    // Vérification que le nouveau mot de passe fonctionne
    const [user] = await connectDB.execute(
      "SELECT password FROM users WHERE id = ?",
      [testUser.id]
    );
    const isValid = await bcrypt.compare("NewTest123!", user[0].password);
    expect(isValid).toBe(true);
  });

  it("devrait rejeter un mot de passe faible", async () => {
    const response = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "NewTest123!",
        newPassword: "weak",
        confirmPassword: "weak",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Le mot de passe doit contenir");
  });

  it("devrait rejeter un ancien mot de passe incorrect", async () => {
    const response = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "WrongPassword",
        newPassword: "NewTest123!",
        confirmPassword: "NewTest123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Échec de la mise à jour");
  });
});
