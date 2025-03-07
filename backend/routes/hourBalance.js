const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");

// @route   GET /api/hour-balance/:employeeId
// @desc    Obtenir le solde d'heures d'un employé
// @access  Private
router.get("/:employeeId", auth, async (req, res) => {
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

module.exports = router;
