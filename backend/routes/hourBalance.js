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

    // Renvoyer le solde dans un format cohérent
    res.json({
      success: true,
      hour_balance: balance,
      balance: balance, // Pour la compatibilité
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du solde d'heures pour l'employé ${req.params.employeeId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du solde d'heures",
      error: error.message,
    });
  }
});

module.exports = router;
