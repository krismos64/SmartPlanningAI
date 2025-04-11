const express = require("express");
const request = require("supertest");
const nodemailer = require("nodemailer");

// Mock de nodemailer
jest.mock("nodemailer");

describe("Route Contact", () => {
  let app;
  let mockSendMail;
  let mockTransporter;

  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();

    // Créer un mock pour sendMail (succès par défaut)
    mockSendMail = jest.fn().mockResolvedValue({
      messageId: "test-message-id",
      response: "250 Message sent",
    });

    // Créer un mock pour createTransport
    mockTransporter = {
      sendMail: mockSendMail,
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Créer une app Express isolée
    app = express();
    app.use(express.json());

    // Configurer les variables d'environnement pour le test
    process.env.SMARTPLANNING_MAIL_USER = "test@example.com";
    process.env.SMARTPLANNING_MAIL_PASSWORD = "test-password";

    // Importer et attacher la route de contact à tester
    const contactRoutes = require("../../routes/contact");
    app.use("/api/contact", contactRoutes);
  });

  describe("POST /api/contact", () => {
    // 1. Test d'un envoi d'email réussi avec tous les champs
    test("devrait envoyer un email et retourner 200 quand tous les champs sont fournis", async () => {
      // Données de test
      const contactData = {
        name: "Durand",
        prenom: "Julie",
        email: "julie.durand@example.com",
        subject: "Demande d'information",
        message: "Bonjour, j'aimerais en savoir plus.",
      };

      // Envoi de la requête
      const response = await request(app)
        .post("/api/contact")
        .send(contactData);

      // Log pour debug si nécessaire
      console.log("Réponse API:", response.status, response.body);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      // Vérifier que nodemailer a été configuré et appelé correctement
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: {
          user: process.env.SMARTPLANNING_MAIL_USER,
          pass: process.env.SMARTPLANNING_MAIL_PASSWORD,
        },
      });

      expect(mockSendMail).toHaveBeenCalledTimes(1);

      // Vérifier le contenu de l'email
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe("contact@smartplanning.fr");
      expect(mailOptions.subject).toBe("📩 Nouveau message de Durand");
      expect(mailOptions.text).toContain("Nom: Durand");
      expect(mailOptions.text).toContain("Prénom: Julie");
      expect(mailOptions.text).toContain("Email: julie.durand@example.com");
      expect(mailOptions.text).toContain("Sujet: Demande d'information");
      expect(mailOptions.text).toContain("Bonjour, j'aimerais en savoir plus.");

      // Vérifier le contenu HTML de l'email
      expect(mailOptions.html).toContain("<strong>Nom:</strong> Durand");
      expect(mailOptions.html).toContain("<strong>Prénom:</strong> Julie");
      expect(mailOptions.html).toContain(
        "<strong>Email:</strong> julie.durand@example.com"
      );
      expect(mailOptions.html).toContain(
        "<strong>Sujet:</strong> Demande d'information"
      );
    });

    // 2. Test d'erreur 400 lorsqu'un champ requis est manquant
    test("devrait retourner une erreur 400 si le champ prenom est manquant", async () => {
      // Données de test avec prenom manquant
      const incompleteData = {
        name: "Durand",
        // prenom manquant
        email: "julie.durand@example.com",
        subject: "Demande d'information",
        message: "Bonjour, j'aimerais en savoir plus.",
      };

      // Envoi de la requête
      const response = await request(app)
        .post("/api/contact")
        .send(incompleteData);

      // Log pour debug si nécessaire
      console.log(
        "Réponse API (champ manquant):",
        response.status,
        response.body
      );

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: "Tous les champs sont obligatoires",
      });

      // Vérifier que nodemailer n'a pas été appelé
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    // 3. Test d'erreur 500 lorsque l'envoi d'email échoue
    test("devrait retourner une erreur 500 si l'envoi de l'email échoue", async () => {
      // Configurer le mock pour simuler un échec d'envoi
      mockSendMail.mockRejectedValue(new Error("Erreur d'envoi simulée"));

      // Données de test complètes
      const contactData = {
        name: "Durand",
        prenom: "Julie",
        email: "julie.durand@example.com",
        subject: "Demande d'information",
        message: "Bonjour, j'aimerais en savoir plus.",
      };

      // Envoi de la requête
      const response = await request(app)
        .post("/api/contact")
        .send(contactData);

      // Log pour debug si nécessaire
      console.log(
        "Réponse API (erreur d'envoi):",
        response.status,
        response.body
      );

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: "Échec de l'envoi du message",
      });

      // Vérifier que nodemailer a été configuré mais a échoué
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });
});
