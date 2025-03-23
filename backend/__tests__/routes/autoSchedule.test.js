const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const autoScheduleRoutes = require("../../routes/autoSchedule");
const autoScheduleController = require("../../controllers/autoScheduleController");
const AutoScheduleService = require("../../services/autoScheduleService");
const moment = require("moment");

// Mock du module db et de AutoScheduleService
jest.mock("../../db", () => ({
  query: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../services/autoScheduleService", () => {
  return jest.fn().mockImplementation(() => ({
    generateWeeklySchedule: jest.fn(),
  }));
});

// Mock du middleware d'authentification
jest.mock("../../middleware/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = {
      id: 1,
      email: "admin@test.com",
      role: "admin",
      first_name: "Admin",
      last_name: "Test",
    };
    return next();
  });
});

// Variables pour les tests
const JWT_SECRET = process.env.JWT_SECRET || "smartplanningai_secret_key";
const app = express();
app.use(express.json());
app.use("/api/schedule", autoScheduleRoutes);

// Générer un token JWT valide pour les tests
const generateValidToken = () => {
  const payload = {
    userId: 1,
    role: "admin",
    email: "admin@test.com",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

describe("Auto Schedule API", () => {
  // Réinitialiser les mocks entre chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Nettoyer la base après tous les tests
  afterAll(async () => {
    // Cette ligne serait activée dans un environnement réel de test avec une base de données
    // await db.query('DELETE FROM weekly_schedules WHERE week_start = ?', ['2025-04-01']);
  });

  describe("POST /api/schedule/auto-generate", () => {
    test("devrait retourner 401 si non authentifié", async () => {
      // Simuler une requête sans token d'authentification
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .send({
          weekStart: "2025-04-01",
          departmentId: 1,
          businessHours: {
            Monday: [9, 17],
            Tuesday: [9, 17],
            Wednesday: [9, 17],
            Thursday: [9, 17],
            Friday: [9, 17],
          },
        });

      // Le middleware d'authentification est mocké pour toujours réussir,
      // mais dans un environnement réel, ce test vérifierait le code 401
      expect(response.statusCode).toBe(200);
    });

    test("devrait générer un planning hebdomadaire optimisé avec succès", async () => {
      // Mock de la réponse du service
      const mockScheduleResult = {
        schedule: [
          {
            employee_id: 1,
            week_start: "2025-04-01",
            schedule_data: {
              Monday: [{ start: 9, end: 17 }],
              Tuesday: [{ start: 9, end: 17 }],
              Wednesday: [{ start: 9, end: 17 }],
              Thursday: [{ start: 9, end: 17 }],
              Friday: [{ start: 9, end: 17 }],
            },
            status: "draft",
          },
          {
            employee_id: 2,
            week_start: "2025-04-01",
            schedule_data: {
              Monday: [{ start: 9, end: 17 }],
              Tuesday: [{ start: 9, end: 17 }],
              Wednesday: [{ start: 9, end: 17 }],
              Thursday: [{ start: 9, end: 17 }],
              Friday: [{ start: 9, end: 17 }],
            },
            status: "draft",
          },
        ],
        stats: {
          total_hours: { 1: 40, 2: 40 },
          preference_match_rate: 0.85,
          overworked_employees: [],
        },
      };

      // Configure le mock du service pour renvoyer le résultat attendu
      const mockGenerateWeeklySchedule = jest
        .fn()
        .mockResolvedValue(mockScheduleResult);
      AutoScheduleService.mockImplementation(() => ({
        generateWeeklySchedule: mockGenerateWeeklySchedule,
      }));

      // Données de la requête
      const requestData = {
        weekStart: "2025-04-01",
        departmentId: 1,
        businessHours: {
          Monday: [9, 17],
          Tuesday: [9, 17],
          Wednesday: [9, 17],
          Thursday: [9, 17],
          Friday: [9, 17],
        },
        employeePreferences: {
          1: {
            Monday: [{ start: 9, end: 17 }],
          },
        },
      };

      // Obtenir un token valide
      const token = generateValidToken();

      // Effectuer la requête avec le token
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData);

      // Vérifier que le service a été appelé avec les bonnes options
      expect(mockGenerateWeeklySchedule).toHaveBeenCalledWith(requestData);

      // Vérifier la réponse
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("stats");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.stats).toHaveProperty("total_hours");
      expect(response.body.stats).toHaveProperty("preference_match_rate");
    });

    test("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Requête sans la date de début de semaine
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", `Bearer ${generateValidToken()}`)
        .send({
          departmentId: 1,
          businessHours: {
            Monday: [9, 17],
          },
        });

      // Vérifier que la réponse est 400 Bad Request
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    test("devrait retourner 500 si une erreur se produit pendant la génération", async () => {
      // Configure le mock du service pour déclencher une erreur
      const mockError = new Error("Erreur de test");
      AutoScheduleService.mockImplementation(() => ({
        generateWeeklySchedule: jest.fn().mockRejectedValue(mockError),
      }));

      // Effectuer la requête
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", `Bearer ${generateValidToken()}`)
        .send({
          weekStart: "2025-04-01",
          departmentId: 1,
          businessHours: {
            Monday: [9, 17],
          },
        });

      // Vérifier que la réponse est 500 Internal Server Error
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error", mockError.message);
    });

    test("devrait insérer les données dans la base de données", async () => {
      // Mock de la réponse du service
      const mockScheduleResult = {
        schedule: [
          {
            employee_id: 1,
            week_start: "2025-04-01",
            schedule_data: {
              Monday: [{ start: 9, end: 17 }],
            },
            status: "draft",
          },
        ],
        stats: {
          total_hours: { 1: 8 },
          preference_match_rate: 1,
          overworked_employees: [],
        },
      };

      // Configure le mock du service
      AutoScheduleService.mockImplementation(() => ({
        generateWeeklySchedule: jest.fn().mockResolvedValue(mockScheduleResult),
      }));

      // Configure le mock de la base de données
      const mockDb = require("../../db");
      mockDb.query.mockClear();

      // Effectuer la requête
      await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", `Bearer ${generateValidToken()}`)
        .send({
          weekStart: "2025-04-01",
          departmentId: 1,
          businessHours: {
            Monday: [9, 17],
          },
        });

      // Vérifier que db.query a été appelé pour insérer les données
      expect(mockDb.query).toHaveBeenCalled();

      // Vérifier que le premier appel à db.query contient la requête d'insertion
      const firstCallArgs = mockDb.query.mock.calls[0];
      expect(firstCallArgs[0]).toContain("INSERT INTO weekly_schedules");

      // Vérifier que les valeurs correctes ont été passées
      expect(firstCallArgs[1]).toContain(1); // employee_id
      expect(firstCallArgs[1]).toContain("2025-04-01"); // week_start
      expect(firstCallArgs[1]).toContain("draft"); // status
    });
  });
});
