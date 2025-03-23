const express = require("express");
const router = express.Router();

// Import des contrôleurs
const authController = require("../controllers/authController");
const employeesController = require("../controllers/employeesController");
const planningController = require("../controllers/planningController");
const statsController = require("../controllers/statsController");
const vacationsController = require("../controllers/vacationsController");

// Import du middleware d'authentification
const authMiddleware = require("../middleware/authMiddleware");

// Import des routes auto-planning
const autoScheduleRoutes = require("./autoSchedule");

// Import des routes des plannings hebdomadaires
const weeklySchedulesRoutes = require("./weeklySchedules");

// Routes d'authentification
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authMiddleware, authController.getCurrentUser);

// Routes des employés
router.get("/employees", authMiddleware, employeesController.getAllEmployees);
router.post("/employees", authMiddleware, employeesController.createEmployee);
router.get(
  "/employees/:id",
  authMiddleware,
  employeesController.getEmployeeById
);
router.put(
  "/employees/:id",
  authMiddleware,
  employeesController.updateEmployee
);
router.delete(
  "/employees/:id",
  authMiddleware,
  employeesController.deleteEmployee
);

// Routes du planning
router.get("/planning", authMiddleware, planningController.getAllEvents);
router.post("/planning", authMiddleware, planningController.createEvent);
router.get("/planning/:id", authMiddleware, planningController.getEventById);
router.put("/planning/:id", authMiddleware, planningController.updateEvent);
router.delete("/planning/:id", authMiddleware, planningController.deleteEvent);

// Routes des congés
router.get("/vacations", authMiddleware, vacationsController.getAllVacations);
router.post("/vacations", authMiddleware, vacationsController.createVacation);
router.get(
  "/vacations/:id",
  authMiddleware,
  vacationsController.getVacationById
);
router.put(
  "/vacations/:id",
  authMiddleware,
  vacationsController.updateVacation
);
router.delete(
  "/vacations/:id",
  authMiddleware,
  vacationsController.deleteVacation
);

// Routes des statistiques
router.get("/stats/overview", authMiddleware, statsController.getOverview);
router.get(
  "/stats/employees",
  authMiddleware,
  statsController.getEmployeeStats
);
router.get(
  "/stats/vacations",
  authMiddleware,
  statsController.getVacationStats
);
router.get("/stats/planning", authMiddleware, statsController.getPlanningStats);

// Utilisation des routes de génération automatique de planning
router.use("/schedule", autoScheduleRoutes);

// Utilisation des routes des plannings hebdomadaires
router.use("/weekly-schedules", weeklySchedulesRoutes);

module.exports = router;
