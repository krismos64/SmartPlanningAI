/**
 * Routes pour la gestion des plannings hebdomadaires
 */

const express = require("express");
const router = express.Router();
const weeklySchedulesController = require("../controllers/weeklySchedulesController");
const authMiddleware = require("../middleware/authMiddleware");

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
 * @route PUT /api/weekly-schedules/:id
 * @desc Met à jour un planning hebdomadaire existant
 * @access Privé
 */
router.put("/:id", authMiddleware, weeklySchedulesController.updateSchedule);

module.exports = router;
