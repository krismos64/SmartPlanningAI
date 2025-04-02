/**
 * Routes pour la gestion des plannings hebdomadaires
 */

const express = require("express");
const router = express.Router();
const weeklySchedulesController = require("../controllers/weeklySchedulesController");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @route POST /api/weekly-schedules
 * @desc Crée un nouveau planning hebdomadaire
 * @access Privé
 */
router.post("/", authMiddleware, weeklySchedulesController.createSchedule);

/**
 * @route GET /api/weekly-schedules/:weekStart
 * @desc Récupère tous les plannings d'une semaine spécifiée
 * @access Privé
 */
router.get(
  "/:weekStart",
  authMiddleware,
  weeklySchedulesController.getSchedulesByWeek
);

/**
 * @route GET /api/weekly-schedules/week/:weekStart
 * @desc Route alternative pour récupérer les plannings d'une semaine spécifiée
 * @access Privé
 */
router.get(
  "/week/:weekStart",
  authMiddleware,
  weeklySchedulesController.getSchedulesByWeek
);

/**
 * @route PUT /api/weekly-schedules/:id
 * @desc Met à jour un planning hebdomadaire existant
 * @access Privé
 */
router.put("/:id", authMiddleware, weeklySchedulesController.updateSchedule);

/**
 * @route DELETE /api/weekly-schedules/:id
 * @desc Supprime un planning hebdomadaire
 * @access Privé
 */
router.delete("/:id", authMiddleware, weeklySchedulesController.deleteSchedule);

module.exports = router;
