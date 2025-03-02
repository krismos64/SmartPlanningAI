const express = require("express");
const router = express.Router();
const PlanningEvent = require("../models/PlanningEvent");
const { auth, checkRole } = require("../middleware/auth");

// Récupérer tous les événements
router.get("/", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé normal, ne montrer que ses propres événements
    if (req.user.role === "employee") {
      const events = await PlanningEvent.findByEmployee(req.user.id);
      return res.json(events);
    }

    // Pour les admins et managers, montrer tous les événements
    const events = await PlanningEvent.find();
    res.json(events);
  } catch (error) {
    console.error("Erreur lors de la récupération du planning:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du planning" });
  }
});

// Récupérer un événement par son ID
router.get("/:id", auth, async (req, res) => {
  try {
    const event = await PlanningEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // Vérifier que l'utilisateur a le droit de voir cet événement
    if (req.user.role === "employee" && event.employee_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à voir cet événement" });
    }

    res.json(event);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'événement ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'événement" });
  }
});

// Créer un nouvel événement
router.post("/", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé, s'assurer qu'il ne crée un événement que pour lui-même
    if (req.user.role === "employee" && req.body.employee_id !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "Vous ne pouvez créer des événements que pour vous-même",
        });
    }

    const event = new PlanningEvent({
      ...req.body,
      created_by: req.user.id,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'événement" });
  }
});

// Mettre à jour un événement
router.put("/:id", auth, async (req, res) => {
  try {
    const event = await PlanningEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // Vérifier les permissions
    if (req.user.role === "employee") {
      // Un employé ne peut modifier que ses propres événements
      if (event.employee_id !== req.user.id) {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas modifier les événements d'autres employés",
          });
      }
    }

    const updatedEvent = await PlanningEvent.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    res.json(updatedEvent);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'événement ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'événement" });
  }
});

// Supprimer un événement
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await PlanningEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // Vérifier les permissions
    if (req.user.role === "employee") {
      // Un employé ne peut supprimer que ses propres événements
      if (event.employee_id !== req.user.id) {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas supprimer les événements d'autres employés",
          });
      }
    }

    const result = await PlanningEvent.delete(req.params.id);

    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'événement ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'événement" });
  }
});

// Récupérer les événements par plage de dates
router.get("/range/:start/:end", auth, async (req, res) => {
  try {
    const { start, end } = req.params;

    // Si l'utilisateur est un employé normal, ne montrer que ses propres événements
    if (req.user.role === "employee") {
      const allEvents = await PlanningEvent.findByDateRange(start, end);
      const userEvents = allEvents.filter(
        (event) => event.employee_id === req.user.id
      );
      return res.json(userEvents);
    }

    // Pour les admins et managers, montrer tous les événements
    const events = await PlanningEvent.findByDateRange(start, end);
    res.json(events);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des événements par plage de dates:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des événements" });
  }
});

// Récupérer les événements par employé
router.get("/employee/:id", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé, il ne peut voir que ses propres événements
    if (
      req.user.role === "employee" &&
      req.params.id !== req.user.id.toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Vous ne pouvez pas voir les événements d'autres employés",
        });
    }

    const events = await PlanningEvent.findByEmployee(req.params.id);
    res.json(events);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des événements de l'employé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des événements" });
  }
});

module.exports = router;
