const express = require("express");
const router = express.Router();
const VacationRequest = require("../models/VacationRequest");
const { auth } = require("../middleware/auth");

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
    res.status(500).json({
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
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à voir cette demande de congé",
      });
    }

    res.json(vacationRequest);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la demande de congé ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération de la demande de congé",
    });
  }
});

// Créer une nouvelle demande de congé
router.post("/", auth, async (req, res) => {
  try {
    // Si l'utilisateur est un employé, s'assurer qu'il ne crée une demande que pour lui-même
    if (
      req.user.role === "employee" &&
      req.body.employee_id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Vous ne pouvez créer des demandes de congé que pour vous-même",
      });
    }

    // Récupérer les informations de l'employé pour avoir son nom complet
    const Employee = require("../models/Employee");
    const employee = await Employee.findById(req.body.employee_id);

    // Créer la demande avec le nom de l'employé
    const vacationData = {
      ...req.body,
      status: "pending", // Toujours commencer avec le statut 'en attente'
    };

    // Ajouter le nom de l'employé si disponible
    if (employee) {
      vacationData.employee_name =
        `${employee.first_name} ${employee.last_name}`.trim();
    }

    const vacationRequest = new VacationRequest(vacationData);
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
      if (vacationRequest.employee_id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez pas modifier les demandes de congé d'autres employés",
        });
      }

      if (vacationRequest.status !== "pending") {
        return res.status(403).json({
          message:
            "Vous ne pouvez pas modifier une demande de congé déjà traitée",
        });
      }

      // Un employé ne peut pas changer le statut
      if (req.body.status && req.body.status !== "pending") {
        return res.status(403).json({
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
      const updateData = { ...req.body };

      // Afficher les informations de l'utilisateur pour le débogage
      console.log("Informations utilisateur pour approbation/rejet:", {
        id: req.user.id,
        role: req.user.role,
        fullName: req.user.fullName,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      });

      // Récupérer les informations de l'utilisateur qui approuve/rejette
      const Employee = require("../models/Employee");
      const approver = await Employee.findById(req.user.id);

      // Définir le nom de l'approbateur
      const approverName = approver
        ? `${approver.first_name} ${approver.last_name}`.trim()
        : "Admin Système";

      if (req.body.status === "approved") {
        // Stocker les informations sur l'approbateur
        updateData.approved_by = approverName;
        updateData.approved_at = new Date();
        // Réinitialiser les informations de rejet si la demande était précédemment rejetée
        updateData.rejected_by = null;
        updateData.rejected_at = null;
        updateData.rejection_reason = null;
      } else if (req.body.status === "rejected") {
        // Stocker les informations sur le rejeteur
        updateData.rejected_by = approverName;
        updateData.rejected_at = new Date();
        // Réinitialiser les informations d'approbation si la demande était précédemment approuvée
        updateData.approved_by = null;
        updateData.approved_at = null;
      } else if (req.body.status === "pending") {
        // Remettre en attente - réinitialiser les informations d'approbation/rejet
        updateData.approved_by = null;
        updateData.approved_at = null;
        updateData.rejected_by = null;
        updateData.rejected_at = null;
        updateData.rejection_reason = null;
      }

      // Mettre à jour avec les données modifiées
      const updatedVacationRequest = await VacationRequest.findByIdAndUpdate(
        req.params.id,
        updateData
      );
      return res.json(updatedVacationRequest);
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
    res.status(500).json({
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
        return res.status(403).json({
          message:
            "Vous ne pouvez pas supprimer les demandes de congé d'autres employés",
        });
      }

      if (vacationRequest.status !== "pending") {
        return res.status(403).json({
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
    res.status(500).json({
      message: "Erreur lors de la suppression de la demande de congé",
    });
  }
});

module.exports = router;
