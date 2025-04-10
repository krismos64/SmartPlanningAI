const request = require("supertest");
const express = require("express");
const nodemailer = require("nodemailer");

// Mocks
jest.mock("nodemailer");

// Configuration des variables d'environnement pour les tests
process.env.SMARTPLANNING_MAIL_USER = "test@example.com";
process.env.SMARTPLANNING_MAIL_PASSWORD = "test-password";

// Pour éviter les problèmes avec la base de données et d'autres dépendances,
// on crée une application Express minimaliste au lieu d'utiliser l'app réelle
const app = express();
app.use(express.json());

// On importe directement la route qu'on veut tester
const contactRoutes = require("../../routes/contact");
app.use("/api/contact", contactRoutes);

describe("Routes Contact", () => {
  let mockSendMail;
  let mockTransporter;

  beforeEach(() => {
    // Réinitialisation des mocks avant chaque test
    jest.clearAllMocks();

    // Configuration du mock pour transporter.sendMail
    mockSendMail = jest.fn().mockResolvedValue({
      messageId: "test-message-id",
      response: "250 Message sent",
    });

    // Configuration du mock pour nodemailer.createTransport
    mockTransporter = {
      sendMail: mockSendMail,
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  describe("POST /api/contact", () => {
    it("devrait envoyer un email et retourner un statut 200 avec succès", async () => {
      // Arrange
      const contactData = {
        name: "Test User",
        email: "test@example.com",
        message: "Ceci est un message de test.",
      };

      // Act
      const response = await request(app)
        .post("/api/contact")
        .send(contactData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      // Vérification que nodemailer a été appelé correctement
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      // Vérification du contenu de l'email
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe("contact@smartplanning.fr");
      expect(mailOptions.subject).toBe("📩 Nouveau message de Test User");
      expect(mailOptions.text).toContain("Test User");
      expect(mailOptions.text).toContain("test@example.com");
      expect(mailOptions.text).toContain("Ceci est un message de test.");
    });

    it("devrait retourner une erreur 400 si un champ est manquant", async () => {
      // Arrange - message manquant
      const incompleteData = {
        name: "Test User",
        email: "test@example.com",
        // message manquant
      };

      // Act
      const response = await request(app)
        .post("/api/contact")
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: "Tous les champs sont obligatoires",
      });

      // Vérification que nodemailer n'a pas été appelé
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("devrait retourner une erreur 500 si l'envoi de l'email échoue", async () => {
      // Arrange
      const contactData = {
        name: "Test User",
        email: "test@example.com",
        message: "Ceci est un message de test.",
      };

      // Configuration du mock pour simuler une erreur lors de l'envoi
      mockSendMail.mockRejectedValue(new Error("Erreur d'envoi simulée"));

      // Act
      const response = await request(app)
        .post("/api/contact")
        .send(contactData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: "Échec de l'envoi du message",
      });

      // Vérification que nodemailer a été appelé mais a échoué
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });
});
