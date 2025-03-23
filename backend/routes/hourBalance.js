const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");
const WorkHours = require("../models/WorkHours");

// @route   GET /api/hour-balance/:employeeId
// @desc    Obtenir le solde d'heures d'un employé
// @access  Private
router.get("/:employeeId", authMiddleware, async (req, res) => {
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

// @route   PUT /api/hour-balance/:employeeId
// @desc    Mettre à jour le solde d'heures d'un employé
// @access  Private
router.put("/:employeeId", authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const hourData = req.body;

    console.log("Données reçues pour mise à jour du solde:", hourData);

    // Vérifier les données minimales requises
    if (!hourData.date || typeof hourData.balance !== "number") {
      return res.status(400).json({
        success: false,
        message: "Données invalides pour la mise à jour du solde d'heures",
      });
    }

    // Enregistrer l'ajustement dans les heures de travail
    const workHoursEntry = {
      employee_id: employeeId,
      date: hourData.date,
      expected_hours: hourData.expected_hours || 0,
      actual_hours: hourData.actual_hours || 0,
      balance: hourData.balance,
      description:
        hourData.description || "Ajustement manuel du solde d'heures",
      user_id: req.user.id || hourData.user_id,
    };

    const result = await WorkHours.create(workHoursEntry);

    if (!result) {
      throw new Error(
        "Échec de l'enregistrement de l'ajustement du solde d'heures"
      );
    }

    // Récupérer le solde mis à jour
    const updatedBalance = await Employee.updateHourBalance(employeeId);

    // Renvoyer la réponse avec le solde mis à jour
    res.json({
      success: true,
      hour_balance: updatedBalance,
      balance: updatedBalance,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du solde d'heures pour l'employé ${req.params.employeeId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du solde d'heures",
      error: error.message,
    });
  }
});

module.exports = router;
