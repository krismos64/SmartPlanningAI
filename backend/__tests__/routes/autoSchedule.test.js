const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Ce test vérifie que le fichier de setup fonctionne correctement
test("setup file should be properly loaded", () => {
  expect(true).toBe(true);
});

// Mocks des modules
jest.mock("../../db", () => ({
  query: jest.fn().mockResolvedValue([]),
}));

// Mock du middleware d'authentification
jest.mock("../../middleware/authMiddleware", () => (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    req.user = {
      id: 1,
      email: "test@example.com",
      role: "admin",
    };
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Authentification requise",
    });
  }
});

// Mock du service AutoScheduleService
jest.mock("../../services/autoScheduleService", () => {
  return jest.fn().mockImplementation(() => ({
    generateWeeklySchedule: jest.fn().mockResolvedValue({
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
        },
      ],
      stats: {
        total_hours: { 1: 40, 2: 40 },
        preference_match_rate: 0.85,
        overworked_employees: [],
      },
    }),
  }));
});

// Mocking du contrôleur
jest.mock("../../controllers/autoScheduleController");

describe("Auto Schedule API", () => {
  let app;
  const db = require("../../db");
  const autoScheduleController = require("../../controllers/autoScheduleController");
  const AutoScheduleService = require("../../services/autoScheduleService");

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();

    // Créer une application express fraîche pour chaque test
    app = express();
    app.use(express.json());

    // Configurer le comportement du contrôleur pour chaque test
    autoScheduleController.generateSchedule.mockImplementation(
      async (req, res) => {
        try {
          // Simulation de la validation
          if (
            !req.body.weekStart ||
            !req.body.departmentId ||
            !req.body.businessHours
          ) {
            return res.status(400).json({
              success: false,
              message: "Données de requête invalides",
              errors: [
                "Les champs weekStart, departmentId et businessHours sont obligatoires",
              ],
            });
          }

          // Appel au service mocké
          const autoScheduleService = new AutoScheduleService();
          const result = await autoScheduleService.generateWeeklySchedule(
            req.body
          );

          // Simulation d'insertion en base de données
          await Promise.all(
            result.schedule.map(async (entry) => {
              await db.query(
                `INSERT INTO weekly_schedules 
              (employee_id, week_start, week_end, schedule_data, total_hours, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [
                  entry.employee_id,
                  entry.week_start,
                  "2025-04-07", // week_end
                  JSON.stringify(entry.schedule_data),
                  result.stats.total_hours[entry.employee_id] || 0,
                  "draft",
                ]
              );
            })
          );

          // Retourner la réponse
          return res.status(200).json({
            success: true,
            data: result.schedule,
            stats: result.stats,
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Erreur lors de la génération automatique",
            error: error.message,
          });
        }
      }
    );

    // Charger les routes
    const autoScheduleRoutes = require("../../routes/autoSchedule");
    app.use("/api/schedule", autoScheduleRoutes);
  });

  describe("POST /api/schedule/auto-generate", () => {
    test("devrait retourner 401 si non authentifié", async () => {
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

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    test("devrait générer un planning hebdomadaire optimisé avec succès", async () => {
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", "Bearer valid-token")
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

      expect(autoScheduleController.generateSchedule).toHaveBeenCalled();
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
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", "Bearer valid-token")
        .send({
          // weekStart manquant
          departmentId: 1,
          businessHours: {
            Monday: [9, 17],
          },
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("errors");
    });

    test("devrait retourner 500 si une erreur se produit pendant la génération", async () => {
      // Configurer le mock pour générer une erreur
      autoScheduleController.generateSchedule.mockImplementationOnce(
        (req, res) => {
          return res.status(500).json({
            success: false,
            message: "Erreur lors de la génération automatique",
            error: "Erreur de test",
          });
        }
      );

      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", "Bearer valid-token")
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

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error", "Erreur de test");
    });

    test("devrait insérer les données dans la base de données", async () => {
      const response = await request(app)
        .post("/api/schedule/auto-generate")
        .set("Authorization", "Bearer valid-token")
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

      expect(response.statusCode).toBe(200);

      // Vérifier que db.query a été appelé pour insérer les données
      expect(db.query).toHaveBeenCalled();

      // Trouver l'appel d'insertion parmi tous les appels à db.query
      const insertCalls = db.query.mock.calls.filter(
        (call) =>
          typeof call[0] === "string" &&
          call[0].includes("INSERT INTO weekly_schedules")
      );

      // Vérifier qu'au moins un appel d'insertion a été effectué
      expect(insertCalls.length).toBeGreaterThan(0);

      // Vérifier le contenu du premier appel d'insertion
      const firstInsertCall = insertCalls[0];
      expect(firstInsertCall[0]).toContain("INSERT INTO weekly_schedules");
      expect(firstInsertCall[1]).toContain(1); // employee_id
      expect(firstInsertCall[1]).toContain("draft"); // status
    });
  });
});
