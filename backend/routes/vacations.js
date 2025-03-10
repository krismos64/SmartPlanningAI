const express = require("express");
const router = express.Router();
const VacationRequest = require("../models/VacationRequest");
const { auth } = require("../middleware/auth");
const db = require("../config/db");

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
      "Erreur lors de la récupération de la demande de congé:",
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
    console.log("POST /api/vacations - Création d'une demande de congés");
    console.log("Body:", req.body);

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

    // Validation des champs obligatoires
    if (
      !req.body.employee_id ||
      !req.body.start_date ||
      !req.body.end_date ||
      !req.body.type
    ) {
      return res.status(400).json({
        message:
          "Les champs employee_id, start_date, end_date et type sont obligatoires",
      });
    }

    // Vérifier que le type est valide
    const validTypes = ["paid", "unpaid", "sick", "other"];
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        message:
          "Le type de congé doit être l'un des suivants : paid, unpaid, sick, other",
      });
    }

    // Récupérer les informations de l'employé pour avoir son nom complet
    const Employee = require("../models/Employee");
    const employee = await Employee.findById(req.body.employee_id);

    if (!employee) {
      return res.status(404).json({
        message: "Employé non trouvé",
      });
    }

    // Filtrer les champs pour ne garder que ceux qui existent dans la table
    const vacationData = {
      employee_id: req.body.employee_id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      type: req.body.type,
      reason: req.body.reason || "",
      status: "pending", // Toujours commencer avec le statut 'en attente'
    };

    // Ajouter le nom de l'employé si disponible
    if (employee) {
      vacationData.employee_name =
        `${employee.first_name} ${employee.last_name}`.trim();
    }

    console.log("Données filtrées pour la création de congé:", vacationData);

    const vacationRequest = new VacationRequest(vacationData);
    await vacationRequest.save();

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité pour la demande de congés"
      );

      const activityData = {
        type: "create",
        entity_type: "vacation",
        entity_id: vacationRequest.id.toString(),
        description: `Nouvelle demande de congés ${vacationRequest.type} du ${vacationRequest.start_date} au ${vacationRequest.end_date}`,
        user_id: req.user.id,
        details: {
          vacation_id: vacationRequest.id,
          employee_id: vacationRequest.employee_id,
          type: vacationRequest.type,
          start_date: vacationRequest.start_date,
          end_date: vacationRequest.end_date,
          status: vacationRequest.status,
        },
      };

      console.log("Données de l'activité:", activityData);

      const activitiesRouter = require("./activities");
      await activitiesRouter.recordActivity(activityData);

      console.log("Activité enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      console.error("Stack trace:", activityError.stack);
      // Ne pas bloquer la création si l'enregistrement de l'activité échoue
    }

    res.status(201).json(vacationRequest);
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la demande de congé",
      error: error.message,
    });
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
        first_name: req.user.first_name,
        last_name: req.user.last_name,
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

/**
 * @route   GET /api/vacations/stats
 * @desc    Récupérer les statistiques des demandes de congés
 * @access  Private
 */
router.get("/stats", auth, async (req, res) => {
  try {
    console.log("Récupération des statistiques de congés");

    // Récupérer toutes les demandes de congés
    const [vacationRequests] = await db.query(
      "SELECT * FROM vacation_requests"
    );

    console.log("Nombre de demandes trouvées:", vacationRequests.length);

    // Même s'il n'y a pas de demandes, retourner des statistiques vides
    const stats = {
      total: vacationRequests.length,
      pending: vacationRequests.filter((vr) => vr.status === "pending").length,
      approved: vacationRequests.filter((vr) => vr.status === "approved")
        .length,
      rejected: vacationRequests.filter((vr) => vr.status === "rejected")
        .length,
      byType: {
        paid: vacationRequests.filter((vr) => vr.type === "paid").length,
        unpaid: vacationRequests.filter((vr) => vr.type === "unpaid").length,
        sick: vacationRequests.filter((vr) => vr.type === "sick").length,
        other: vacationRequests.filter((vr) => vr.type === "other").length,
      },
      byMonth: {},
    };

    // Calculer les statistiques par mois seulement s'il y a des demandes
    if (vacationRequests.length > 0) {
      vacationRequests.forEach((vr) => {
        const startDate = new Date(vr.start_date);
        const month = startDate.getMonth() + 1; // Les mois commencent à 0
        const year = startDate.getFullYear();
        const key = `${year}-${month.toString().padStart(2, "0")}`;

        if (!stats.byMonth[key]) {
          stats.byMonth[key] = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
          };
        }

        stats.byMonth[key].total++;
        stats.byMonth[key][vr.status]++;
      });
    }

    console.log("Statistiques calculées:", stats);
    res.json(stats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de congés:",
      error
    );
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de congés",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/vacations/test-stats
 * @desc    Route de test pour les statistiques de vacances
 * @access  Public
 */
router.get("/test-stats", async (req, res) => {
  console.log("Route GET /api/vacations/test-stats appelée");

  try {
    // Récupérer toutes les demandes de congés
    const [vacationRequests] = await db.query(
      "SELECT * FROM vacation_requests"
    );

    console.log("Demandes de congés trouvées:", vacationRequests.length);

    // Statistiques simplifiées
    const stats = {
      total: vacationRequests.length,
      pending: vacationRequests.filter((vr) => vr.status === "pending").length,
      approved: vacationRequests.filter((vr) => vr.status === "approved")
        .length,
      rejected: vacationRequests.filter((vr) => vr.status === "rejected")
        .length,
      byType: {
        paid: vacationRequests.filter((vr) => vr.type === "paid").length,
        unpaid: vacationRequests.filter((vr) => vr.type === "unpaid").length,
        sick: vacationRequests.filter((vr) => vr.type === "sick").length,
        other: vacationRequests.filter((vr) => vr.type === "other").length,
      },
    };

    console.log("Statistiques calculées:", stats);
    res.json(stats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de test:",
      error
    );
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de test",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/vacations/:id/status
 * @desc    Mettre à jour le statut d'une demande de congé (approuver/rejeter)
 * @access  Private (Admin, Manager)
 */
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Vérifier que le statut est valide
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        message:
          "Statut invalide. Les valeurs acceptées sont: approved, rejected, pending",
      });
    }

    // Vérifier que l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à modifier le statut des demandes de congé",
      });
    }

    // Récupérer la demande de congé
    const vacationRequest = await VacationRequest.findById(id);
    if (!vacationRequest) {
      return res.status(404).json({ message: "Demande de congé non trouvée" });
    }

    // Récupérer les informations de l'utilisateur qui approuve/rejette
    const Employee = require("../models/Employee");
    const approver = await Employee.findById(req.user.id);

    // Définir le nom de l'approbateur
    const approverName = approver
      ? `${approver.first_name} ${approver.last_name}`.trim()
      : "Admin Système";

    // Préparer les données de mise à jour
    const updateData = { status };

    if (status === "approved") {
      // Stocker les informations sur l'approbateur
      updateData.approved_by = approverName;
      updateData.approved_at = new Date();
      // Réinitialiser les informations de rejet si la demande était précédemment rejetée
      updateData.rejected_by = null;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;
    } else if (status === "rejected") {
      // Stocker les informations sur le rejeteur
      updateData.rejected_by = approverName;
      updateData.rejected_at = new Date();
      updateData.rejection_reason = comment || null;
      // Réinitialiser les informations d'approbation si la demande était précédemment approuvée
      updateData.approved_by = null;
      updateData.approved_at = null;
    } else if (status === "pending") {
      // Remettre en attente - réinitialiser les informations d'approbation/rejet
      updateData.approved_by = null;
      updateData.approved_at = null;
      updateData.rejected_by = null;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;
    }

    // Mettre à jour la demande de congé
    const updatedVacationRequest = await VacationRequest.findByIdAndUpdate(
      id,
      updateData
    );

    // Journaliser l'activité
    if (global.Activity) {
      try {
        // Utiliser la méthode logActivity qui existe dans le modèle
        await global.Activity.logActivity({
          type: "vacation_status_update",
          entity_type: "vacation",
          entity_id: id,
          description: `Statut de la demande de congé mis à jour: ${status}`,
          user_id: req.user.id,
          details: {
            previous_status: vacationRequest.status,
            new_status: status,
            comment: comment || null,
          },
        });
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité:",
          logError
        );
        // Ne pas bloquer la mise à jour si la journalisation échoue
      }
    }

    res.json(updatedVacationRequest);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de la demande de congé ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut de la demande de congé",
      details: error.message,
    });
  }
});

module.exports = router;
