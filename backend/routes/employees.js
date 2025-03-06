// routes/employees.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth, checkRole } = require("../middleware/auth");
const { recordActivity } = require("../routes/activities");
const Activity = require("../models/Activity");
const db = require("../config/db");

// @route   GET /api/employees
// @desc    Obtenir tous les employés
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des employés" });
  }
});

// @route   GET /api/employees/:id
// @desc    Obtenir un employé par ID
// @access  Public
router.get("/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'employé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'employé" });
  }
});

// @route   POST /api/employees
// @desc    Créer un nouvel employé
// @access  Private (Admin)
router.post("/", auth, async (req, res) => {
  try {
    const employeeData = req.body;

    // Validation des données
    if (
      !employeeData.first_name ||
      !employeeData.last_name ||
      !employeeData.email
    ) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le prénom, le nom et l'email de l'employé",
      });
    }

    // Créer l'employé
    const employee = new Employee(employeeData);
    const employeeId = await employee.save();

    // Récupérer l'employé créé
    const newEmployee = await Employee.findById(employeeId);

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité de création pour l'employé:",
        {
          id: employeeId,
          name: `${employeeData.first_name} ${employeeData.last_name}`,
          userId: req.user.id,
        }
      );

      await recordActivity({
        type: "create",
        entity_type: "employee",
        entity_id: employeeId,
        description: `Création de l'employé ${employeeData.first_name} ${employeeData.last_name}`,
        user_id: req.user.id,
        details: {
          employeeId: employeeId,
          employeeName: `${employeeData.first_name} ${employeeData.last_name}`,
          department: employeeData.department,
        },
      });

      console.log("Activité de création enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // On continue malgré l'erreur d'activité
    }

    res.status(201).json({
      success: true,
      message: "Employé créé avec succès",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'employé",
      error: error.message,
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Mettre à jour un employé
// @access  Public
router.put("/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'employé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'employé" });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Supprimer un employé
// @access  Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    // Vérifier si l'employé existe
    const [employees] = await db.query("SELECT * FROM employees WHERE id = ?", [
      id,
    ]);

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      });
    }

    const employee = employees[0];

    // Supprimer l'employé
    await db.query("DELETE FROM employees WHERE id = ?", [id]);

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité de suppression pour l'employé:",
        {
          id,
          name: `${employee.first_name} ${employee.last_name}`,
          userId: req.user.id,
        }
      );

      await recordActivity({
        type: "delete",
        entity_type: "employee",
        entity_id: id,
        description: `Suppression de l'employé ${employee.first_name} ${employee.last_name}`,
        user_id: req.user.id,
        details: {
          employeeId: employee.id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          department: employee.department,
        },
      });

      console.log("Activité de suppression enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // On continue malgré l'erreur d'activité
    }

    res.json({
      success: true,
      message: "Employé supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'employé",
      error: error.message,
    });
  }
});

module.exports = router;
