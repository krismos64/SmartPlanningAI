/**
 * Routes pour la génération automatique de planning
 */

const express = require("express");
const router = express.Router();
const autoScheduleController = require("../controllers/autoScheduleController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route POST /api/schedule/auto-generate
 * @desc Génère automatiquement un planning hebdomadaire optimisé
 * @access Privé (authentification requise)
 */
router.post(
  "/auto-generate",
  authMiddleware,
  autoScheduleController.generateSchedule
);

module.exports = router;
