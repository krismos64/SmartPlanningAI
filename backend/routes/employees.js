// routes/employees.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth, checkRole } = require("../middleware/auth");

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
// @access  Public
router.post("/", auth, async (req, res) => {
  try {
    console.log("Données reçues dans la route POST /api/employees:", req.body);
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    console.error("Message d'erreur:", error.message);
    console.error("Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'employé" });
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
// @access  Public
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Employee.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'employé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'employé" });
  }
});

module.exports = router;
