const express = require("express");
const router = express.Router();
const WorkHours = require("../models/WorkHours");
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");

// @route   GET /api/work-hours/balance/:employeeId
// @desc    Obtenir le solde d'heures d'un employé
// @access  Private
router.get("/balance/:employeeId", auth, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Mettre à jour le solde d'heures avant de le récupérer
    const balance = await Employee.updateHourBalance(employeeId);

    res.json({ hour_balance: balance });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du solde d'heures pour l'employé ${req.params.employeeId}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération du solde d'heures",
      error: error.message,
    });
  }
});

// @route   GET /api/work-hours/employee/:employeeId
// @desc    Obtenir toutes les heures travaillées d'un employé (appartenant à l'utilisateur connecté)
// @access  Private
router.get("/employee/:employeeId", auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // Vérifier que l'employé appartient bien à l'utilisateur connecté
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    if (employee.user_id !== userId) {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à accéder aux données de cet employé",
      });
    }

    // Récupérer les heures travaillées pour cet employé et cet utilisateur
    const workHours = await WorkHours.findByEmployeeAndUser(
      employeeId,
      userId,
      startDate,
      endDate
    );

    res.json(workHours);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des heures travaillées:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des heures travaillées",
    });
  }
});

// @route   GET /api/work-hours/:id
// @desc    Obtenir un enregistrement d'heures travaillées par ID (appartenant à l'utilisateur connecté)
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const workHoursId = req.params.id;

    // Récupérer l'enregistrement des heures
    const workHours = await WorkHours.findById(workHoursId);

    if (!workHours) {
      return res.status(404).json({
        message: "Enregistrement d'heures non trouvé",
      });
    }

    // Vérifier que ces heures appartiennent à l'utilisateur connecté
    if (workHours.user_id !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à accéder à cet enregistrement",
      });
    }

    res.json(workHours);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des heures avec l'ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des heures travaillées",
    });
  }
});

// @route   POST /api/work-hours
// @desc    Créer un nouvel enregistrement d'heures travaillées
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { employee_id, date, expected_hours, actual_hours, description } =
      req.body;

    // Vérifier que l'employé appartient bien à l'utilisateur connecté
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    if (employee.user_id !== userId) {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à enregistrer des heures pour cet employé",
      });
    }

    // Créer l'enregistrement des heures avec le user_id
    const workHoursData = {
      employee_id,
      date,
      expected_hours,
      actual_hours,
      description,
      user_id: userId,
    };

    const workHours = new WorkHours(workHoursData);
    await workHours.save();

    // Mettre à jour le solde d'heures de l'employé
    await Employee.updateHourBalance(employee_id);

    res.status(201).json(workHours);
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'enregistrement des heures:",
      error
    );
    res.status(500).json({
      message:
        "Erreur serveur lors de la création de l'enregistrement des heures",
    });
  }
});

// @route   PUT /api/work-hours/:id
// @desc    Mettre à jour un enregistrement d'heures travaillées
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { employee_id, date, expected_hours, actual_hours } = req.body;

    // Vérifier si l'enregistrement existe
    let workHours = await WorkHours.findById(req.params.id);
    if (!workHours) {
      return res
        .status(404)
        .json({ message: "Enregistrement d'heures non trouvé" });
    }

    // Mettre à jour les propriétés
    workHours.employee_id = employee_id || workHours.employee_id;
    workHours.date = date || workHours.date;
    workHours.expected_hours =
      expected_hours !== undefined ? expected_hours : workHours.expected_hours;
    workHours.actual_hours =
      actual_hours !== undefined ? actual_hours : workHours.actual_hours;

    // Enregistrer les modifications
    await workHours.save();

    res.json({
      message: "Heures travaillées mises à jour avec succès",
      workHours,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour des heures avec l'ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la mise à jour des heures travaillées",
      error: error.message,
    });
  }
});

// @route   DELETE /api/work-hours/:id
// @desc    Supprimer un enregistrement d'heures travaillées
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const success = await WorkHours.delete(req.params.id);

    if (!success) {
      return res
        .status(404)
        .json({ message: "Enregistrement d'heures non trouvé" });
    }

    res.json({ message: "Heures travaillées supprimées avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression des heures avec l'ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la suppression des heures travaillées",
      error: error.message,
    });
  }
});

module.exports = router;
