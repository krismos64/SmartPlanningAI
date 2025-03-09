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
// @desc    Obtenir toutes les heures travaillées d'un employé
// @access  Private
router.get("/employee/:employeeId", auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const workHours = await WorkHours.findByEmployeeId(
      employeeId,
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
      message: "Erreur lors de la récupération des heures travaillées",
      error: error.message,
    });
  }
});

// @route   GET /api/work-hours/:id
// @desc    Obtenir un enregistrement d'heures travaillées par ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const workHours = await WorkHours.findById(req.params.id);

    if (!workHours) {
      return res
        .status(404)
        .json({ message: "Enregistrement d'heures non trouvé" });
    }

    res.json(workHours);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des heures avec l'ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des heures travaillées",
      error: error.message,
    });
  }
});

// @route   POST /api/work-hours
// @desc    Créer un nouvel enregistrement d'heures travaillées
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const {
      employee_id,
      employeeId,
      date,
      expected_hours,
      expectedHours,
      actual_hours,
      actualHours,
      hours,
      balance,
      description,
    } = req.body;

    // Utiliser les versions camelCase ou snake_case selon ce qui est disponible
    const employeeID = employee_id || employeeId;
    const expectedHrs = expected_hours || expectedHours || 7.0;
    const actualHrs = actual_hours || actualHours || hours || 0.0;

    // Validation des données
    if (!employeeID || !date) {
      return res.status(400).json({
        message: "L'ID de l'employé et la date sont requis",
      });
    }

    // Vérifier si l'employé existe
    const employee = await Employee.findById(employeeID);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Créer l'enregistrement d'heures
    const workHours = await WorkHours.create({
      employee_id: employeeID,
      date,
      expected_hours: expectedHrs,
      actual_hours: actualHrs,
      balance: balance !== undefined ? balance : actualHrs - expectedHrs,
      description: description || "Ajout manuel",
    });

    // Mettre à jour le solde d'heures de l'employé
    await Employee.updateHourBalance(employeeID);

    res.status(201).json({
      success: true,
      message: "Heures travaillées enregistrées avec succès",
      workHours,
    });
  } catch (error) {
    console.error("Erreur lors de la création des heures travaillées:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création des heures travaillées",
      error: error.message,
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
