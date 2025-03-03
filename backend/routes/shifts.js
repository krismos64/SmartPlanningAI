const express = require("express");
const router = express.Router();
const Shift = require("../models/Shift");
const { auth, checkRole } = require("../middleware/auth");

// @route   GET /api/shifts
// @desc    Obtenir tous les shifts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { start, end, employee } = req.query;
    let query = {};

    // Filtrer par période si spécifiée
    if (start && end) {
      query.startTime = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    // Filtrer par employé si spécifié
    if (employee) {
      query.employee = employee;
    }

    const shifts = await Shift.find(query)
      .populate("employee", "firstName lastName")
      .populate("createdBy", "firstName lastName")
      .sort({ startTime: 1 });

    res.json(shifts);
  } catch (error) {
    console.error("Erreur lors de la récupération des shifts:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des shifts" });
  }
});

// @route   POST /api/shifts
// @desc    Créer un nouveau shift
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { employee, startTime, endTime, notes } = req.body;

    // Créer le nouveau shift
    const newShift = new Shift({
      employee,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id,
      notes,
    });

    // Vérifier les chevauchements
    const hasOverlap = await newShift.hasOverlap();
    if (hasOverlap) {
      return res.status(400).json({
        message: "Ce créneau chevauche un autre shift existant",
      });
    }

    await newShift.save();
    const populatedShift = await Shift.findById(newShift._id)
      .populate("employee", "firstName lastName")
      .populate("createdBy", "firstName lastName");

    res.status(201).json(populatedShift);
  } catch (error) {
    console.error("Erreur lors de la création du shift:", error);
    res.status(500).json({ message: "Erreur lors de la création du shift" });
  }
});

// @route   PUT /api/shifts/:id
// @desc    Mettre à jour un shift
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { startTime, endTime, notes } = req.body;
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Shift non trouvé" });
    }

    // Mettre à jour les champs
    shift.startTime = new Date(startTime);
    shift.endTime = new Date(endTime);
    shift.notes = notes;

    // Vérifier les chevauchements
    const hasOverlap = await shift.hasOverlap();
    if (hasOverlap) {
      return res.status(400).json({
        message: "Ce créneau chevauche un autre shift existant",
      });
    }

    await shift.save();
    const updatedShift = await Shift.findById(shift._id)
      .populate("employee", "firstName lastName")
      .populate("createdBy", "firstName lastName");

    res.json(updatedShift);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du shift:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du shift" });
  }
});

// @route   DELETE /api/shifts/:id
// @desc    Supprimer un shift
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Shift non trouvé" });
    }

    await shift.remove();
    res.json({ message: "Shift supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du shift:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du shift" });
  }
});

module.exports = router;
