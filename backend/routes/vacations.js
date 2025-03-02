const express = require("express");
const router = express.Router();
const VacationRequest = require("../models/VacationRequest");
const { auth, checkRole } = require("../middleware/auth");

// Récupérer toutes les demandes de congés
router.get("/", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé normal, ne montrer que ses propres demandes
    if (req.user.role === "employee") {
      // Nous devons implémenter cette fonctionnalité dans le modèle
      // Pour l'instant, filtrons côté serveur
      const allRequests = await VacationRequest.find();
      const userRequests = allRequests.filter(
        (req) => req.employee_id === req.user.id
      );
      return res.json(userRequests);
    }

    // Pour les admins et managers, montrer toutes les demandes
    const vacationRequests = await VacationRequest.find();
    res.json(vacationRequests);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de congés:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des demandes de congés",
      });
  }
});

// Récupérer une demande de congé par son ID
router.get("/:id", auth, async (req, res) => {
  try {
    const vacationRequest = await VacationRequest.findById(req.params.id);

    if (!vacationRequest) {
      return res.status(404).json({ message: "Demande de congé non trouvée" });
    }

    // Vérifier que l'utilisateur a le droit de voir cette demande
    if (
      req.user.role === "employee" &&
      vacationRequest.employee_id !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          message: "Vous n'êtes pas autorisé à voir cette demande de congé",
        });
    }

    res.json(vacationRequest);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la demande de congé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération de la demande de congé",
      });
  }
});

// Créer une nouvelle demande de congé
router.post("/", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé, s'assurer qu'il ne crée une demande que pour lui-même
    if (req.user.role === "employee" && req.body.employee_id !== req.user.id) {
      return res
        .status(403)
        .json({
          message:
            "Vous ne pouvez créer des demandes de congé que pour vous-même",
        });
    }

    const vacationRequest = new VacationRequest({
      ...req.body,
      status: "pending", // Toujours commencer avec le statut 'en attente'
    });

    await vacationRequest.save();
    res.status(201).json(vacationRequest);
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la demande de congé" });
  }
});

// Mettre à jour une demande de congé
router.put("/:id", auth, async (req, res) => {
  try {
    const vacationRequest = await VacationRequest.findById(req.params.id);

    if (!vacationRequest) {
      return res.status(404).json({ message: "Demande de congé non trouvée" });
    }

    // Vérifier les permissions
    if (req.user.role === "employee") {
      // Un employé ne peut modifier que ses propres demandes et seulement si elles sont en attente
      if (vacationRequest.employee_id !== req.user.id) {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas modifier les demandes de congé d'autres employés",
          });
      }

      if (vacationRequest.status !== "pending") {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas modifier une demande de congé déjà traitée",
          });
      }

      // Un employé ne peut pas changer le statut
      if (req.body.status && req.body.status !== "pending") {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas changer le statut d'une demande de congé",
          });
      }
    }

    // Pour les managers et admins, permettre l'approbation/rejet
    if (
      (req.user.role === "manager" || req.user.role === "admin") &&
      req.body.status
    ) {
      if (req.body.status === "approved") {
        req.body.approved_by = req.user.id;
        req.body.approved_at = new Date();
      } else if (req.body.status === "rejected") {
        req.body.rejected_by = req.user.id;
        req.body.rejected_at = new Date();
      }
    }

    const updatedVacationRequest = await VacationRequest.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json(updatedVacationRequest);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de la demande de congé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la mise à jour de la demande de congé",
      });
  }
});

// Supprimer une demande de congé
router.delete("/:id", auth, async (req, res) => {
  try {
    const vacationRequest = await VacationRequest.findById(req.params.id);

    if (!vacationRequest) {
      return res.status(404).json({ message: "Demande de congé non trouvée" });
    }

    // Vérifier les permissions
    if (req.user.role === "employee") {
      // Un employé ne peut supprimer que ses propres demandes et seulement si elles sont en attente
      if (vacationRequest.employee_id !== req.user.id) {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas supprimer les demandes de congé d'autres employés",
          });
      }

      if (vacationRequest.status !== "pending") {
        return res
          .status(403)
          .json({
            message:
              "Vous ne pouvez pas supprimer une demande de congé déjà traitée",
          });
      }
    }

    await VacationRequest.delete(req.params.id);
    res.json({ message: "Demande de congé supprimée avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la demande de congé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression de la demande de congé",
      });
  }
});

module.exports = router;
