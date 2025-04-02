/**
 * Tests pour vérifier les requêtes dynamiques du chatbot SmartPlanningAI
 * Ce test vérifie la capacité du chatbot à répondre à des questions personnalisées
 * avec des données dynamiques depuis la base MySQL
 */

// Imports
const { auth } = require("../backend/middleware/auth");
const request = require("supertest");
const express = require("express");
const chatbotRoutes = require("../backend/routes/chatbotRoutes");

// Mocks
jest.mock("../backend/middleware/auth", () => ({
  auth: jest.fn((req, res, next) => {
    req.user = {
      id: 1,
      role: "admin",
    };
    next();
  }),
}));

// Mock pour la connexion à la base de données
jest.mock("../backend/config/db", () => {
  const mockExecute = jest.fn();

  // Configurer des réponses différentes en fonction des requêtes
  mockExecute.mockImplementation((query, params) => {
    if (query.includes("vacation_requests") && query.includes("approved")) {
      return [
        [
          {
            id: 1,
            first_name: "Jean",
            last_name: "Dupont",
            department: "Ventes",
            reason: "congé",
          },
          {
            id: 2,
            first_name: "Marie",
            last_name: "Martin",
            department: "Support",
            reason: "congé",
          },
        ],
      ];
    }

    if (query.includes("shifts") && query.includes("start_time")) {
      return [
        [
          {
            id: 3,
            first_name: "Paul",
            last_name: "Durand",
            department: "Technique",
            start_time: "09:00",
            end_time: "17:00",
            hours: 8,
          },
          {
            id: 4,
            first_name: "Sophie",
            last_name: "Leroy",
            department: "Administration",
            start_time: "08:30",
            end_time: "16:30",
            hours: 8,
          },
        ],
      ];
    }

    if (query.includes("vacation_balance")) {
      return [[{ vacation_balance: 12 }]];
    }

    if (query.includes("weekly_schedules") && query.includes("monday")) {
      return [[{ total_hours: 35, monday: '"08:00"', tuesday: '"08:00"' }]];
    }

    if (query.includes("employees WHERE id")) {
      return [
        [
          {
            id: 1,
            first_name: "Test",
            last_name: "Utilisateur",
            vacation_balance: 12,
            hour_balance: 5,
          },
        ],
      ];
    }

    if (query.includes("employees WHERE user_id")) {
      return [[{ id: 1 }]];
    }

    return [[]];
  });

  return {
    execute: mockExecute,
    promise: () => Promise.resolve(),
  };
});

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.use("/api/chatbot", chatbotRoutes);

describe("Tests des requêtes dynamiques du chatbot", () => {
  // Test des réponses à des questions standards (FAQ)
  describe("Questions standards", () => {
    test("Répond à une salutation", async () => {
      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Bonjour" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Bonjour");
    });

    test("Répond à une demande d'aide", async () => {
      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Comment puis-je obtenir de l'aide?" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message.toLowerCase()).toContain("aide");
    });
  });

  // Test des requêtes de données personnalisées
  describe("Questions personnalisées avec données dynamiques", () => {
    test("Retourne les personnes absentes aujourd'hui", async () => {
      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Qui ne travaille pas aujourd'hui?" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBe("get_absences_today");
      expect(response.body.actions).toContain("get_absences_today");
    });

    test("Retourne les personnes travaillant aujourd'hui", async () => {
      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Qui travaille aujourd'hui?" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBe("get_working_today");
      expect(response.body.actions).toContain("get_working_today");
    });

    test("Vérifie le solde de congés personnel", async () => {
      // Changer temporairement le rôle à 'employee' pour ce test
      auth.mockImplementationOnce((req, res, next) => {
        req.user = { id: 1, role: "employee" };
        next();
      });

      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Quel est mon solde de congés?" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBe("MY_VACATION_BALANCE");
      expect(response.body.message).toContain("12 jours");
    });

    test("Vérifie le planning personnel", async () => {
      // Changer temporairement le rôle à 'employee' pour ce test
      auth.mockImplementationOnce((req, res, next) => {
        req.user = { id: 1, role: "employee" };
        next();
      });

      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Montre-moi mon planning" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBe("MY_SCHEDULE");
      expect(response.body.message).toContain("35 heures");
    });
  });

  // Test des permissions
  describe("Vérification des permissions", () => {
    test("Employé ne peut pas accéder aux données administratives", async () => {
      // Configurer le rôle utilisateur comme employé
      auth.mockImplementationOnce((req, res, next) => {
        req.user = { id: 1, role: "employee" };
        next();
      });

      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "Qui a son solde d'heures positif?" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBe("PERMISSION_DENIED");
      expect(response.body.message).toContain("permissions");
    });
  });

  // Test des erreurs
  describe("Gestion des erreurs", () => {
    test("Question incompréhensible", async () => {
      const response = await request(app)
        .post("/api/chatbot/process")
        .send({ message: "xyz123 blabla" });

      expect(response.status).toBe(200);
      // Dans notre implémentation actuelle, le chatbot essaie toujours de donner une réponse
      // même pour les questions qu'il ne comprend pas
      expect(response.body.success).toBe(true);
    });
  });
});
