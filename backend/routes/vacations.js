const express = require("express");
const router = express.Router();
const VacationRequest = require("../models/VacationRequest");
const { auth } = require("../middleware/auth");
const { getCurrentAdminId } = require("../middleware/auth");
const db = require("../config/db");
const Employee = require("../models/Employee");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// Récupérer toutes les demandes de congés
router.get("/", auth, async (req, res) => {
  try {
    console.log(
      "GET /api/vacations - Utilisateur connecté:",
      req.user.id,
      "Role:",
      req.user.role
    );

    // Débogage du token utilisé pour l'authentification
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : "Non fourni";
    console.log(
      "Token utilisé (premières 10 caractères):",
      token.substring(0, 10) + "..."
    );

    // Récupérer tous les employés associés à cet utilisateur
    let employeeIds = [];

    // Ajouter l'ID de l'utilisateur lui-même
    employeeIds.push(req.user.id);

    // Pour les utilisateurs admin, récupérer tous les employés associés
    if (req.user.role === "admin") {
      const [employees] = await db.execute(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id]
      );

      if (employees.length > 0) {
        // Ajouter les IDs des employés à la liste
        employees.forEach((emp) => {
          if (!employeeIds.includes(emp.id)) {
            employeeIds.push(emp.id);
          }
        });
      }

      console.log("Employés associés:", employeeIds);
    }

    // Récupérer toutes les demandes, puis filtrer
    console.log("Récupération de toutes les demandes de congés...");
    const allRequests = await VacationRequest.find();
    console.log(`${allRequests.length} demandes trouvées au total`);

    // Debug: Afficher toutes les demandes avec les IDs des employés et des créateurs
    console.log("Liste de toutes les demandes:");
    allRequests.forEach((req) => {
      console.log(
        `Demande #${req.id}: employee_id=${req.employee_id}, creator_id=${req.creator_id}, status=${req.status}`
      );
    });

    // Filtrer les demandes pour ne garder que celles des employés associés ou créées par l'utilisateur
    const vacationRequests = allRequests.filter((vacation) => {
      // Si l'utilisateur est l'employé concerné par la demande
      if (
        vacation.employee_id &&
        Number(vacation.employee_id) === Number(req.user.id)
      ) {
        console.log(
          `Demande #${vacation.id}: L'utilisateur est l'employé concerné`
        );
        return true;
      }

      // Si l'utilisateur est le créateur de la demande
      if (
        vacation.creator_id &&
        Number(vacation.creator_id) === Number(req.user.id)
      ) {
        console.log(
          `Demande #${vacation.id}: L'utilisateur est le créateur de la demande`
        );
        return true;
      }

      // Debug pour comprendre pourquoi la demande 33 n'est pas incluse si l'utilisateur est 12
      if (vacation.id === 33 && req.user.id === 12) {
        console.log("ANALYSE DÉTAILLÉE DEMANDE #33:");
        console.log(
          `- employee_id: ${
            vacation.employee_id
          } (${typeof vacation.employee_id})`
        );
        console.log(
          `- creator_id: ${vacation.creator_id} (${typeof vacation.creator_id})`
        );
        console.log(`- user.id: ${req.user.id} (${typeof req.user.id})`);
        console.log(
          `- Comparaison creator_id === user.id: ${
            Number(vacation.creator_id) === Number(req.user.id)
          }`
        );
      }

      // Pour les autres demandes, vérifier si c'est un employé associé à l'utilisateur
      const isEmployeeAssociated = employeeIds.includes(
        Number(vacation.employee_id)
      );
      if (isEmployeeAssociated) {
        console.log(
          `Demande #${vacation.id}: L'employé est associé à l'utilisateur`
        );
      }
      return isEmployeeAssociated;
    });

    console.log(
      `Après filtrage: ${vacationRequests.length} demandes pour l'utilisateur ${req.user.id} (incluant celles qu'il a créées)`
    );

    // Debug: Afficher les demandes filtrées
    console.log("Liste des demandes filtrées:");
    vacationRequests.forEach((req) => {
      console.log(
        `Demande #${req.id}: employee_id=${req.employee_id}, creator_id=${req.creator_id}, status=${req.status}`
      );
    });

    // Retourner avec le format standardisé
    return res.json({
      success: true,
      message: "Demandes de congés récupérées avec succès",
      data: vacationRequests,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de congés:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des demandes de congés",
      error: error.message,
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
    console.log("Utilisateur connecté:", req.user);

    // Si l'utilisateur est un employé, s'assurer qu'il ne crée une demande que pour lui-même
    if (
      req.user.role === "employee" &&
      req.body.employee_id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
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
        success: false,
        message:
          "Les champs employee_id, start_date, end_date et type sont obligatoires",
      });
    }

    // Vérifier que le type est valide
    const validTypes = ["paid", "unpaid", "sick", "other"];
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        message:
          "Le type de congé doit être l'un des suivants : paid, unpaid, sick, other",
      });
    }

    // Récupérer les informations de l'employé pour avoir son nom complet
    const employee = await Employee.findById(req.body.employee_id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      });
    }

    // Filtrer les champs pour ne garder que ceux qui existent dans la table
    const vacationData = {
      employee_id: req.body.employee_id,
      creator_id: req.user.id, // Ajouter l'ID de l'utilisateur connecté comme créateur
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

    const result = await VacationRequest.create(vacationData);

    if (result.success) {
      // Enregistrer l'activité
      await Activity.logActivity({
        user_id: req.user.id,
        action: "create",
        entity_type: "vacation_request",
        entity_id: result.id,
        description: `Demande de congés créée pour ${employee.first_name} ${
          employee.last_name
        } du ${new Date(
          req.body.start_date
        ).toLocaleDateString()} au ${new Date(
          req.body.end_date
        ).toLocaleDateString()}`,
        type: "create",
        details: {
          employee_id: req.body.employee_id,
          employee_name: `${employee.first_name} ${employee.last_name}`.trim(),
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          type: req.body.type,
          reason: req.body.reason || "",
        },
      });

      // Créer une notification pour les administrateurs et managers
      // Les employés n'ont pas accès à l'application, donc on notifie uniquement les utilisateurs avec rôle admin/manager
      const users = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'manager')"
      );

      if (users && users[0] && users[0].length > 0) {
        for (const user of users[0]) {
          await Notification.createAndBroadcast({
            user_id: user.id,
            title: "Nouvelle demande de congés",
            message: `Une nouvelle demande de congés a été soumise par ${
              employee.first_name
            } ${employee.last_name} du ${new Date(
              req.body.start_date
            ).toLocaleDateString()} au ${new Date(
              req.body.end_date
            ).toLocaleDateString()}.`,
            type: "info",
            entity_type: "vacation_request",
            entity_id: result.id,
            link: `/vacations/${result.id}`,
          });
        }
      }

      res.status(201).json({
        success: true,
        id: result.id,
        message: "Demande de congés créée avec succès",
      });
    } else {
      res.status(400).json({
        success: false,
        message:
          result.message ||
          "Erreur lors de la création de la demande de congés",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error);

    // Vérifier si l'erreur est due à une contrainte de clé étrangère
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" &&
      error.message.includes("employee_id")
    ) {
      return res.status(400).json({
        message: "L'employé spécifié n'existe pas dans la base de données",
        error: error.message,
      });
    }

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

    // Si l'employé est modifié, vérifier qu'il existe
    if (req.body.employee_id) {
      const Employee = require("../models/Employee");
      const employee = await Employee.findById(req.body.employee_id);

      if (!employee) {
        return res.status(404).json({
          message: "Employé non trouvé",
        });
      }
    }

    // Pour les managers et admins, permettre l'approbation/rejet
    if (
      (req.user.role === "manager" || req.user.role === "admin") &&
      req.body.status
    ) {
      const updateData = { ...req.body };

      // Obtenir l'ID de l'administrateur qui approuve/rejette
      const adminId = req.user.id;
      if (!adminId) {
        return res
          .status(400)
          .json({ message: "ID d'administrateur manquant" });
      }

      // Selon le statut, mettre à jour les informations appropriées
      if (req.body.status === "approved") {
        // Stocker les informations d'approbation
        updateData.approved_by = adminId; // Utiliser l'ID au lieu du nom
        updateData.approved_at = new Date();
        // Réinitialiser les informations de rejet
        updateData.rejected_by = null;
        updateData.rejected_at = null;
        updateData.rejection_reason = null;
      } else if (req.body.status === "rejected") {
        // Stocker les informations de rejet
        updateData.rejected_by = adminId; // Utiliser l'ID au lieu du nom
        updateData.rejected_at = new Date();
        // Réinitialiser les informations d'approbation
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

      // Journaliser l'activité de mise à jour
      if (global.Activity) {
        try {
          // Récupérer les informations de l'employé concerné par la demande de congé
          const Employee = require("../models/Employee");
          const employee = await Employee.findById(
            updatedVacationRequest.employee_id
          );
          const employeeName = employee
            ? `${employee.first_name} ${employee.last_name}`.trim()
            : `Employé #${updatedVacationRequest.employee_id}`;

          // Utiliser la méthode logActivity qui existe dans le modèle
          await global.Activity.logActivity({
            type: "update",
            entity_type: "vacation",
            entity_id: req.params.id,
            description: `Mise à jour de la demande de congé #${req.params.id}`,
            user_id: req.user.id,
            details: {
              employee_id: updatedVacationRequest.employee_id,
              employee_name: employeeName,
              vacation_type: updatedVacationRequest.type,
              start_date: updatedVacationRequest.start_date,
              end_date: updatedVacationRequest.end_date,
              reason: updatedVacationRequest.reason || "",
              status: updatedVacationRequest.status,
              previous_data: {
                employee_id: vacationRequest.employee_id,
                type: vacationRequest.type,
                start_date: vacationRequest.start_date,
                end_date: vacationRequest.end_date,
                reason: vacationRequest.reason || "",
                status: vacationRequest.status,
              },
            },
          });
          console.log(`Activité de mise à jour journalisée avec succès`);
        } catch (logError) {
          console.error(
            "Erreur lors de la journalisation de l'activité de mise à jour:",
            logError
          );
          // Ne pas bloquer la mise à jour si la journalisation échoue
        }
      }

      res.json(updatedVacationRequest);
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

    // Vérifier si c'est une erreur de contrainte de clé étrangère
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" &&
      error.sqlMessage &&
      error.sqlMessage.includes("employee_id")
    ) {
      return res.status(400).json({
        message: "L'employé spécifié n'existe pas dans la base de données",
        details: "Veuillez sélectionner un employé valide",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la mise à jour de la demande de congé",
      details: error.message,
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

    // Journaliser l'activité de suppression
    if (global.Activity) {
      try {
        // Utiliser la méthode logActivity qui existe dans le modèle
        await global.Activity.logActivity({
          type: "delete",
          entity_type: "vacation",
          entity_id: req.params.id,
          description: `Suppression de la demande de congé #${req.params.id}`,
          user_id: req.user.id,
          details: {
            employee_id: vacationRequest.employee_id,
            employee_name:
              vacationRequest.employee_name ||
              `Employé #${vacationRequest.employee_id}`,
            vacation_type: vacationRequest.type,
            start_date: vacationRequest.start_date,
            end_date: vacationRequest.end_date,
            reason: vacationRequest.reason || "",
            status: vacationRequest.status,
          },
        });
        console.log(`Activité de suppression journalisée avec succès`);
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité de suppression:",
          logError
        );
        // Ne pas bloquer la suppression si la journalisation échoue
      }
    }

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

    console.log(
      `Tentative de mise à jour du statut de la demande de congé ${id} à "${status}"`
    );

    // Vérifier que le statut est valide
    if (!["approved", "rejected", "pending"].includes(status)) {
      console.log(`Statut invalide: ${status}`);
      return res.status(400).json({
        message:
          "Statut invalide. Les valeurs acceptées sont: approved, rejected, pending",
      });
    }

    // Vérifier que l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      console.log(`Utilisateur non autorisé: ${req.user.role}`);
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à modifier le statut des demandes de congé",
      });
    }

    // Récupérer la demande de congé
    const vacationRequest = await VacationRequest.findById(id);
    if (!vacationRequest) {
      console.log(`Demande de congé non trouvée: ${id}`);
      return res.status(404).json({ message: "Demande de congé non trouvée" });
    }

    console.log(`Demande de congé trouvée:`, vacationRequest);

    // Récupérer les informations de l'utilisateur qui approuve/rejette
    const Employee = require("../models/Employee");
    const approver = await Employee.findById(req.user.id);

    // Définir le nom de l'approbateur
    const approverName = approver
      ? `${approver.first_name} ${approver.last_name}`.trim()
      : "Admin Système";

    console.log(`Approbateur: ${approverName} (ID: ${req.user.id})`);

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

    console.log(`Données de mise à jour:`, updateData);

    try {
      // Mettre à jour la demande de congé
      const updatedVacationRequest = await VacationRequest.findByIdAndUpdate(
        id,
        updateData
      );

      if (!updatedVacationRequest) {
        console.log(`Échec de la mise à jour de la demande de congé ${id}`);
        return res.status(500).json({
          message:
            "Erreur lors de la mise à jour du statut de la demande de congé",
          details: "La mise à jour a échoué",
        });
      }

      console.log(
        `Demande de congé mise à jour avec succès:`,
        updatedVacationRequest
      );

      // Journaliser l'activité
      if (global.Activity) {
        try {
          // Récupérer les informations de l'employé concerné par la demande de congé
          const Employee = require("../models/Employee");
          const employee = await Employee.findById(vacationRequest.employee_id);
          const employeeName = employee
            ? `${employee.first_name} ${employee.last_name}`.trim()
            : `Employé #${vacationRequest.employee_id}`;

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
              employee_id: vacationRequest.employee_id,
              employee_name: employeeName,
              vacation_type: vacationRequest.type,
              start_date: vacationRequest.start_date,
              end_date: vacationRequest.end_date,
              reason: vacationRequest.reason || "",
              approver_name: approverName,
            },
          });
          console.log(`Activité journalisée avec succès`);
        } catch (logError) {
          console.error(
            "Erreur lors de la journalisation de l'activité:",
            logError
          );
          // Ne pas bloquer la mise à jour si la journalisation échoue
        }
      }

      // Notifier les autres administrateurs et managers du changement de statut
      // (sauf celui qui a fait la modification)
      const users = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'manager') AND id != ?",
        [req.user.id]
      );

      if (users && users[0] && users[0].length > 0) {
        // Récupérer les informations de l'employé
        const employee = await Employee.findById(vacationRequest.employee_id);
        const employeeName = employee
          ? `${employee.first_name} ${employee.last_name}`.trim()
          : `Employé #${vacationRequest.employee_id}`;

        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType = "info";

        if (status === "approved") {
          notificationTitle = "Demande de congés approuvée";
          notificationMessage = `La demande de congés de ${employeeName} du ${new Date(
            vacationRequest.start_date
          ).toLocaleDateString()} au ${new Date(
            vacationRequest.end_date
          ).toLocaleDateString()} a été approuvée par ${approverName}.`;
          notificationType = "success";
        } else if (status === "rejected") {
          notificationTitle = "Demande de congés refusée";
          notificationMessage = `La demande de congés de ${employeeName} du ${new Date(
            vacationRequest.start_date
          ).toLocaleDateString()} au ${new Date(
            vacationRequest.end_date
          ).toLocaleDateString()} a été refusée par ${approverName}.`;
          notificationType = "error";
        } else {
          notificationTitle = "Statut de demande de congés mis à jour";
          notificationMessage = `Le statut de la demande de congés de ${employeeName} du ${new Date(
            vacationRequest.start_date
          ).toLocaleDateString()} au ${new Date(
            vacationRequest.end_date
          ).toLocaleDateString()} a été remis en attente par ${approverName}.`;
        }

        for (const user of users[0]) {
          await Notification.createAndBroadcast({
            user_id: user.id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            entity_type: "vacation_request",
            entity_id: id,
            link: `/vacations/${id}`,
          });
        }
      }

      res.json(updatedVacationRequest);
    } catch (updateError) {
      console.error(
        `Erreur lors de la mise à jour de la demande de congé ${id}:`,
        updateError
      );

      // Vérifier si c'est une erreur de contrainte de clé étrangère
      if (
        updateError.code === "ER_NO_REFERENCED_ROW_2" &&
        updateError.sqlMessage &&
        updateError.sqlMessage.includes("employee_id")
      ) {
        return res.status(400).json({
          message: "L'employé spécifié n'existe pas dans la base de données",
          details: "Veuillez sélectionner un employé valide",
        });
      }

      res.status(500).json({
        message:
          "Erreur lors de la mise à jour du statut de la demande de congé",
        details: updateError.message,
      });
    }
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de la demande de congé ${req.params.id}:`,
      error
    );

    // Vérifier si c'est une erreur de contrainte de clé étrangère
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" &&
      error.sqlMessage &&
      error.sqlMessage.includes("employee_id")
    ) {
      return res.status(400).json({
        message: "L'employé spécifié n'existe pas dans la base de données",
        details: "Veuillez sélectionner un employé valide",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut de la demande de congé",
      details: error.message,
    });
  }
});

// Récupérer toutes les demandes de congés pour les employés d'un manager
router.get("/manager", auth, async (req, res) => {
  try {
    // Récupérer l'ID de l'admin connecté
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(400).json({ message: "ID d'administrateur manquant" });
    }

    // Utiliser la méthode dédiée pour récupérer les demandes des employés de ce manager
    const requests = await VacationRequest.findByManagerId(adminId);

    res.json(requests);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de congés:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
