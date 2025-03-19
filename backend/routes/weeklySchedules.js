const express = require("express");
const router = express.Router();
const WeeklySchedule = require("../models/WeeklySchedule");
const { auth } = require("../middleware/auth");
const { formatDateForMySQL } = require("../utils/dateUtils");
const scheduleOptimizer = require("../services/scheduleOptimizer");
const db = require("../config/db");

// Middleware d'authentification pour toutes les routes
router.use(auth);

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
    console.log("Requête reçue pour les plannings de la semaine:", weekStart);

    if (!weekStart) {
      console.log("Erreur: Date de début de semaine manquante");
      return res
        .status(400)
        .json({ message: "Date de début de semaine requise" });
    }

    // Formater la date pour MySQL
    const formattedWeekStart = formatDateForMySQL(weekStart);
    console.log("Date formatée pour MySQL:", formattedWeekStart);

    if (!formattedWeekStart) {
      console.log("Erreur: Format de date invalide");
      return res.status(400).json({ message: "Format de date invalide" });
    }

    try {
      const schedules = await WeeklySchedule.findByWeek(formattedWeekStart);
      console.log(
        `${schedules.length} plannings trouvés pour la semaine du ${formattedWeekStart}`
      );

      res.json(schedules);
    } catch (dbError) {
      console.error("Erreur lors de la requête à la base de données:", dbError);
      res.status(500).json({
        message: "Erreur lors de la récupération des plannings",
        details: dbError.message,
      });
    }
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des plannings pour la semaine du ${req.params.weekStart}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des plannings",
      details: error.message,
    });
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
 * @route   GET /api/weekly-schedules/employee/:employeeId/week/:weekStart
 * @desc    Récupérer un planning pour un employé et une semaine spécifiques
 * @access  Private
 */
router.get("/employee/:employeeId/week/:weekStart", async (req, res) => {
  try {
    const { employeeId, weekStart } = req.params;
    console.log(
      "Requête reçue pour le planning de l'employé:",
      employeeId,
      "semaine du:",
      weekStart
    );

    if (!employeeId || !weekStart) {
      console.log("Erreur: ID employé ou date de début de semaine manquant");
      return res.status(400).json({
        success: false,
        message: "ID employé et date de début de semaine requis",
      });
    }

    // Formater la date pour MySQL
    const formattedWeekStart = formatDateForMySQL(weekStart);
    console.log("Date formatée pour MySQL:", formattedWeekStart);

    if (!formattedWeekStart) {
      console.log("Erreur: Format de date invalide");
      return res.status(400).json({
        success: false,
        message: "Format de date invalide",
      });
    }

    const schedule = await WeeklySchedule.findByEmployeeAndWeek(
      employeeId,
      formattedWeekStart
    );

    if (!schedule) {
      console.log("Aucun planning trouvé pour cet employé et cette semaine");
      return res.json({
        success: true,
        message: "Aucun planning trouvé pour cet employé et cette semaine",
        schedule: null,
      });
    }

    console.log("Planning trouvé avec ID:", schedule.id);
    res.json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du planning pour l'employé ${req.params.employeeId} et la semaine du ${req.params.weekStart}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du planning",
    });
  }
});

/**
 * @route   POST /api/weekly-schedules
 * @desc    Créer un nouveau planning hebdomadaire
 * @access  Private
 */
router.post("/", async (req, res) => {
  try {
    console.log("Requête POST reçue pour créer un planning:", req.body);

    const { employee_id, week_start, schedule_data, total_hours, status } =
      req.body;

    // Validation des données
    if (!employee_id) {
      console.error("ID employé manquant");
      return res.status(400).json({ message: "L'ID de l'employé est requis" });
    }

    // Si week_start n'est pas fourni, utiliser la date du lundi de la semaine courante
    let weekStartDate = week_start;
    if (!weekStartDate) {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster quand aujourd'hui est dimanche
      weekStartDate = new Date(today.setDate(diff)).toISOString().split("T")[0];
      console.log(
        "Date de début de semaine générée automatiquement:",
        weekStartDate
      );
    }

    console.log("Vérification de l'existence d'un planning pour:", {
      employee_id,
      week_start: weekStartDate,
    });

    // Vérifier si un planning existe déjà pour cet employé et cette semaine
    const existingSchedule = await WeeklySchedule.findByEmployeeAndWeek(
      employee_id,
      weekStartDate
    );

    // Validation du format JSON pour schedule_data
    let validatedScheduleData;
    try {
      // Si c'est une chaîne, vérifier que c'est un JSON valide
      if (typeof schedule_data === "string") {
        JSON.parse(schedule_data); // Juste pour valider
        validatedScheduleData = schedule_data;
      } else {
        // Si c'est un objet, le convertir en JSON
        validatedScheduleData = JSON.stringify(schedule_data);
      }
    } catch (error) {
      console.error("Données de planning invalides:", error);
      return res.status(400).json({
        message: "Les données du planning ne sont pas un JSON valide",
        error: error.message,
      });
    }

    // Validation du total des heures
    const validatedTotalHours = parseFloat(total_hours) || 0;

    if (existingSchedule) {
      console.log(
        "Planning existant trouvé, mise à jour:",
        existingSchedule.id
      );
      // Mettre à jour le planning existant
      const updatedSchedule = await WeeklySchedule.update(existingSchedule.id, {
        schedule_data: validatedScheduleData,
        total_hours: validatedTotalHours,
        status,
      });

      return res.json(updatedSchedule);
    }

    console.log("Aucun planning existant, création d'un nouveau planning");

    // Calculer la date de fin (week_start + 6 jours)
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const week_end = endDate.toISOString().split("T")[0];

    console.log("Données du planning à créer:", {
      employee_id,
      week_start: weekStartDate,
      week_end,
      schedule_data:
        typeof validatedScheduleData === "string"
          ? "JSON string"
          : validatedScheduleData,
      total_hours: validatedTotalHours,
      status: status || "draft",
      created_by: req.user ? req.user.id : 1,
    });

    // Créer un nouveau planning
    const newSchedule = new WeeklySchedule({
      employee_id,
      week_start: weekStartDate,
      week_end,
      schedule_data: validatedScheduleData,
      total_hours: validatedTotalHours,
      status: status || "draft",
      created_by: req.user ? req.user.id : 1, // Utiliser l'ID de l'utilisateur authentifié ou une valeur par défaut
    });

    const savedSchedule = await newSchedule.save();
    console.log("Planning créé avec succès:", savedSchedule);

    // Enregistrer l'activité
    try {
      const { recordActivity } = require("./activities");
      await recordActivity({
        type: "create",
        entity_type: "planning",
        entity_id: savedSchedule.id.toString(), // Convertir en string pour assurer la compatibilité
        description: `Création d'un planning pour l'employé #${employee_id}`,
        user_id: req.user ? req.user.id : 1,
        details: {
          employee_id,
          week_start: weekStartDate,
          week_end,
          total_hours: validatedTotalHours,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // Continuer malgré l'erreur d'activité
    }

    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error("Erreur détaillée lors de la création du planning:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Erreur lors de la création du planning",
      error: error.message,
    });
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

/**
 * @route   POST /api/weekly-schedules/generate
 * @desc    Générer un planning optimisé pour une semaine
 * @access  Private
 */
router.post("/generate", async (req, res) => {
  try {
    const {
      week_start,
      department_id,
      min_hours_per_employee,
      max_hours_per_employee,
      opening_hours,
      employee_ids,
      priority_rules,
    } = req.body;

    // Vérifier les paramètres obligatoires
    if (!week_start) {
      return res.status(400).json({
        success: false,
        message: "Date de début de semaine requise",
      });
    }

    console.log(
      `Demande de génération de planning pour la semaine du ${week_start}`
    );

    // Récupérer les employés spécifiés si une liste d'IDs est fournie
    let employees = null;
    if (
      employee_ids &&
      Array.isArray(employee_ids) &&
      employee_ids.length > 0
    ) {
      try {
        const [employeesData] = await db.query(
          "SELECT * FROM employees WHERE id IN (?) AND status = 'active'",
          [employee_ids]
        );

        employees = employeesData;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des employés spécifiés:",
          error
        );
      }
    }

    // Appeler le service d'optimisation
    const optimizationResult =
      await scheduleOptimizer.generateOptimizedSchedule({
        weekStart: week_start,
        departmentId: department_id,
        employees,
        minHoursPerEmployee: min_hours_per_employee,
        maxHoursPerEmployee: max_hours_per_employee,
        openingHours: opening_hours,
        priorityRules: priority_rules,
      });

    if (!optimizationResult.success) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la génération du planning",
        error: optimizationResult.error,
      });
    }

    // Enregistrer l'activité
    try {
      const { recordActivity } = require("./activities");
      await recordActivity({
        type: "generate",
        entity_type: "planning",
        entity_id: "optimized_schedule",
        description: `Génération automatique d'un planning pour la semaine du ${week_start}`,
        user_id: req.user ? req.user.id : null,
        details: {
          week_start,
          department_id,
          employee_count: employees ? employees.length : "tous",
          stats: optimizationResult.stats,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // Continuer malgré l'erreur d'activité
    }

    // Retourner le planning optimisé
    res.json({
      success: true,
      message: "Planning généré avec succès",
      schedule: optimizationResult.schedule,
      stats: optimizationResult.stats,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du planning:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du planning",
      error: error.message,
    });
  }
});

module.exports = router;
