const express = require("express");
const router = express.Router();

// Import du middleware d'authentification et de limitation de taux
const { authMiddleware } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimit");
const { auth } = require("../middleware/auth"); // Import du middleware auth comme fallback

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

// Middleware d'authentification à utiliser pour toutes les routes protégées
// Utiliser auth au lieu de authMiddleware en cas de problème
const authMiddlewareToUse =
  typeof authMiddleware === "function" ? authMiddleware : auth;

// Toutes les autres routes nécessitent une authentification
router.use("/employees", authMiddlewareToUse, require("./employees"));
router.use("/departments", authMiddlewareToUse, require("./departments"));
router.use("/planning", authMiddlewareToUse, require("./shifts"));
router.use("/vacations", authMiddlewareToUse, require("./vacations"));
router.use(
  "/weekly-schedules",
  authMiddlewareToUse,
  require("./weeklySchedules")
);
router.use("/schedule", authMiddlewareToUse, require("./autoSchedule"));
router.use("/stats", authMiddlewareToUse, require("./stats"));
router.use("/schedule-stats", authMiddlewareToUse, require("./scheduleStats"));
router.use("/users", authMiddlewareToUse, require("./users"));
router.use("/hour-balance", authMiddlewareToUse, require("./hourBalance"));
router.use("/work-hours", authMiddlewareToUse, require("./workHoursRoutes"));
router.use("/activities", authMiddlewareToUse, require("./activities"));
router.use("/notifications", authMiddlewareToUse, require("./notifications"));
// S'assurer que chatbotRoutes exporte un routeur et non un objet
const chatbotRouter = require("./chatbotRoutes");
router.use("/chatbot", authMiddlewareToUse, chatbotRouter);
// S'assurer que admin exporte un routeur et non un objet
const adminRouter = require("./admin");
router.use("/admin", authMiddlewareToUse, adminRouter);

module.exports = router;
