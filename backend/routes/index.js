const express = require("express");
const router = express.Router();

// Import du middleware d'authentification et de limitation de taux
const { authMiddleware } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimit");

// Routes CSRF (accessibles sans authentification)
router.use("/csrf", require("./csrfRoutes"));

// Route CSRF token (pour la sécurité)
// Cette route est conservée pour rétrocompatibilité
router.get("/csrf-token", (req, res) => {
  return require("./csrfRoutes").handle(req, res);
});

// Import et utilisation des routes
// Routes d'authentification (login/register) - sans authMiddleware mais avec authLimiter
router.use("/auth", require("./auth")); // authLimiter est géré dans le fichier auth.js lui-même

// Route du formulaire de contact (publique)
router.use("/contact", require("./contact"));

// Toutes les autres routes nécessitent une authentification
router.use("/employees", authMiddleware, require("./employees"));
router.use("/departments", authMiddleware, require("./departments"));
router.use("/planning", authMiddleware, require("./shifts"));
router.use("/vacations", authMiddleware, require("./vacations"));
router.use("/weekly-schedules", authMiddleware, require("./weeklySchedules"));
router.use("/schedule", authMiddleware, require("./autoSchedule"));
router.use("/stats", authMiddleware, require("./stats"));
router.use("/schedule-stats", authMiddleware, require("./scheduleStats"));
router.use("/users", authMiddleware, require("./users"));
router.use("/hour-balance", authMiddleware, require("./hourBalance"));
router.use("/work-hours", authMiddleware, require("./workHoursRoutes"));
router.use("/activities", authMiddleware, require("./activities"));
router.use("/notifications", authMiddleware, require("./notifications"));
router.use("/chatbot", authMiddleware, require("./chatbotRoutes"));
router.use("/admin", authMiddleware, require("./admin"));

module.exports = router;
