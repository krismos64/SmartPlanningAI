const express = require("express");
const router = express.Router();
const WeeklySchedule = require("../models/WeeklySchedule");
const Employee = require("../models/Employee");
const { auth, checkRole, authenticateToken } = require("../middleware/auth");

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @route   GET /api/weekly-schedules
 * @desc    Récupérer tous les plannings hebdomadaires
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const schedules = await WeeklySchedule.findAll();
    res.json(schedules);
  } catch (error) {
    console.error("Erreur lors de la récupération des plannings:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des plannings" });
  }
});

/**
 * @route   GET /api/weekly-schedules/week/:weekStart
 * @desc    Récupérer les plannings pour une semaine spécifique
 * @access  Private
 */
router.get("/week/:weekStart", async (req, res) => {
  try {
    const { weekStart } = req.params;

    if (!weekStart) {
      return res
        .status(400)
        .json({ message: "Date de début de semaine requise" });
    }

    const schedules = await WeeklySchedule.findByWeek(weekStart);
    res.json(schedules);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des plannings pour la semaine du ${req.params.weekStart}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des plannings" });
  }
});

/**
 * @route   GET /api/weekly-schedules/employee/:employeeId
 * @desc    Récupérer les plannings pour un employé spécifique
 * @access  Private
 */
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "ID employé requis" });
    }

    const schedules = await WeeklySchedule.findByEmployee(employeeId);
    res.json(schedules);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des plannings pour l'employé ${req.params.employeeId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des plannings" });
  }
});

/**
 * @route   GET /api/weekly-schedules/:id
 * @desc    Récupérer un planning spécifique par son ID
 * @access  Private
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID planning requis" });
    }

    const schedule = await WeeklySchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    res.json(schedule);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du planning ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du planning" });
  }
});

/**
 * @route   POST /api/weekly-schedules
 * @desc    Créer un nouveau planning hebdomadaire
 * @access  Private
 */
router.post("/", async (req, res) => {
  try {
    const { employee_id, week_start, schedule_data, total_hours, status } =
      req.body;

    // Validation des données
    if (!employee_id || !week_start) {
      return res
        .status(400)
        .json({ message: "ID employé et date de début de semaine requis" });
    }

    // Vérifier si un planning existe déjà pour cet employé et cette semaine
    const existingSchedule = await WeeklySchedule.findByEmployeeAndWeek(
      employee_id,
      week_start
    );

    if (existingSchedule) {
      // Mettre à jour le planning existant
      const updatedSchedule = await WeeklySchedule.update(existingSchedule.id, {
        schedule_data,
        total_hours,
        status,
      });

      return res.json(updatedSchedule);
    }

    // Calculer la date de fin (week_start + 6 jours)
    const startDate = new Date(week_start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const week_end = endDate.toISOString().split("T")[0];

    // Créer un nouveau planning
    const newSchedule = new WeeklySchedule({
      employee_id,
      week_start,
      week_end,
      schedule_data,
      total_hours,
      status: status || "draft",
      created_by: req.user ? req.user.id : 1, // Utiliser l'ID de l'utilisateur authentifié ou une valeur par défaut
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error("Erreur lors de la création du planning:", error);
    res.status(500).json({ message: "Erreur lors de la création du planning" });
  }
});

/**
 * @route   PUT /api/weekly-schedules/:id
 * @desc    Mettre à jour un planning hebdomadaire
 * @access  Private
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_data, total_hours, status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID planning requis" });
    }

    // Vérifier si le planning existe
    const existingSchedule = await WeeklySchedule.findById(id);

    if (!existingSchedule) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    // Mettre à jour le planning
    const updatedSchedule = await WeeklySchedule.update(id, {
      schedule_data,
      total_hours,
      status,
    });

    res.json(updatedSchedule);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du planning ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du planning" });
  }
});

/**
 * @route   DELETE /api/weekly-schedules/:id
 * @desc    Supprimer un planning hebdomadaire
 * @access  Private
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID planning requis" });
    }

    // Vérifier si le planning existe
    const existingSchedule = await WeeklySchedule.findById(id);

    if (!existingSchedule) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    // Supprimer le planning
    await WeeklySchedule.delete(id);

    res.json({ message: "Planning supprimé avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression du planning ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du planning" });
  }
});

module.exports = router;
