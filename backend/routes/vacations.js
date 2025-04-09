const express = require("express");
const router = express.Router();
const VacationRequest = require("../models/VacationRequest");
const { auth, getCurrentAdminId } = require("../middleware/auth");
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

    // DEBUG: Vérification complète de la demande
    console.log("Headers de la requête:", req.headers);
    console.log("Paramètres de la requête:", req.query);
    console.log("Corps de la requête:", req.body);

    // Récupérer directement toutes les demandes de congés, sans filtrage
    // Cela nous permettra de vérifier si des données existent dans la BDD
    console.log(
      `Récupération des demandes de congés pour l'utilisateur ${req.user.id}...`
    );

    // SÉCURITÉ: Filtre sur user_id pour que chaque utilisateur ne puisse voir que
    // les demandes de congés des employés qui lui sont rattachés
    const [allRequestsRaw] = await db.execute(
      `
      SELECT vr.*, 
             e.first_name as employee_first_name, 
             e.last_name as employee_last_name,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name
      FROM vacation_requests vr
      LEFT JOIN employees e ON vr.employee_id = e.id
      WHERE e.user_id = ?  -- Restriction de sécurité: uniquement les employés rattachés à l'utilisateur connecté
    `,
      [req.user.id]
    );

    console.log(
      `${allRequestsRaw.length} demandes trouvées pour l'utilisateur ${req.user.id}`
    );

    // Traiter les données pour s'assurer que employee_name est défini
    const processedRequests = allRequestsRaw.map((request) => {
      // Vérifier et corriger employee_name si nécessaire
      if (!request.employee_name || request.employee_name.trim() === " ") {
        if (request.employee_first_name && request.employee_last_name) {
          request.employee_name =
            `${request.employee_first_name} ${request.employee_last_name}`.trim();
          console.log(
            `Vacation ID ${request.id}: nom reconstruit = ${request.employee_name}`
          );
        } else {
          request.employee_name = `Employé #${request.employee_id}`;
          console.log(
            `Vacation ID ${request.id}: aucun nom trouvé, ID utilisé = ${request.employee_name}`
          );
        }
      }
      return request;
    });

    // IMPORTANT: Toujours retourner les données, même en mode débug
    console.log("Renvoyer toutes les demandes au client sans filtrage");

    return res.json({
      success: true,
      message: `${processedRequests.length} demandes de congés trouvées`,
      data: processedRequests,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de congé:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des demandes de congé",
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
      req.body.employee_id &&
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
    const validTypes = [
      "paid",
      "unpaid",
      "sick",
      "rtt",
      "exceptional",
      "recovery",
      "other",
    ];
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        message:
          "Le type de congé doit être l'un des suivants : paid, unpaid, sick, rtt, exceptional, recovery, other",
      });
    }

    // S'assurer que employee_id est un nombre
    let employeeId;
    try {
      employeeId = parseInt(req.body.employee_id, 10);
      if (isNaN(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "L'ID de l'employé doit être un nombre valide",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "L'ID de l'employé doit être un nombre valide",
        error: error.message,
      });
    }

    // Récupérer les informations de l'employé pour avoir son nom complet
    try {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employé non trouvé",
        });
      }

      // SÉCURITÉ: Vérifier que l'employee_id fourni correspond à un employé appartenant à l'utilisateur connecté
      if (employee.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Accès interdit à cette ressource.",
        });
      }

      // Filtrer les champs pour ne garder que ceux qui existent dans la table
      const vacationData = {
        employee_id: employeeId,
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

      // Appel au modèle pour créer la demande
      const result = await VacationRequest.create(vacationData);

      if (result && result.insertId) {
        // Enregistrer l'activité
        await Activity.logActivity({
          user_id: req.user.id,
          action: "create",
          entity_type: "vacation_request",
          entity_id: result.insertId,
          description: `Demande de congés créée pour ${employee.first_name} ${
            employee.last_name
          } du ${new Date(
            req.body.start_date
          ).toLocaleDateString()} au ${new Date(
            req.body.end_date
          ).toLocaleDateString()}`,
          type: "create",
          details: {
            employee_id: employeeId,
            employee_name:
              `${employee.first_name} ${employee.last_name}`.trim(),
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            type: req.body.type,
            reason: req.body.reason || "",
          },
        });

        // Créer des notifications pour tous les utilisateurs admin et managers
        try {
          const [users] = await db.execute(
            "SELECT id FROM users WHERE role IN ('admin', 'manager')"
          );

          if (users && users.length > 0) {
            for (const user of users) {
              console.log(
                `Tentative de création de notification pour l'utilisateur ${user.id}`
              );

              const notificationTitle = `Nouvelle demande de congés`;
              const notificationMessage = `Une nouvelle demande de congés a été créée pour ${
                vacationData.employee_name
              } du ${new Date(req.body.start_date).toLocaleDateString(
                "fr-FR"
              )} au ${new Date(req.body.end_date).toLocaleDateString(
                "fr-FR"
              )} par ${req.user.first_name} ${req.user.last_name}.`;

              await Notification.createAndBroadcast({
                user_id: user.id,
                title: notificationTitle,
                message: notificationMessage,
                type: "info",
                entity_type: "vacation_request",
                entity_id: result.insertId,
                link: `/vacations/${result.insertId}`,
              });
            }
          }
        } catch (notifError) {
          console.error(
            "Erreur lors de la création des notifications:",
            notifError
          );
          // Ne pas échouer la requête en cas d'erreur de notification
        }

        // Répondre avec succès
        return res.status(201).json({
          success: true,
          message: "Demande de congé créée avec succès",
          data: result,
          id: result.insertId,
        });
      } else {
        throw new Error("Échec lors de la création de la demande de congé");
      }
    } catch (employeeError) {
      console.error(
        "Erreur lors de la récupération de l'employé:",
        employeeError
      );
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'employé",
        error: employeeError.message,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error);
    res.status(500).json({
      success: false,
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

    // SÉCURITÉ: Vérifier que la demande ciblée appartient bien à un employé lié à l'utilisateur connecté
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      // Récupérer l'employé associé à la demande
      const employee = await Employee.findById(vacationRequest.employee_id);

      if (!employee || employee.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Accès interdit à cette ressource." });
      }
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
      } else if (req.body.status === "rejected") {
        // Stocker les informations de rejet
        updateData.rejected_by = adminId; // Utiliser l'ID au lieu du nom
        updateData.rejected_at = new Date();

        // Si un commentaire est fourni, l'ajouter à la raison existante
        if (req.body.comment) {
          updateData.reason = vacationRequest.reason
            ? `${vacationRequest.reason} | Motif de rejet: ${req.body.comment}`
            : `Motif de rejet: ${req.body.comment}`;
          // Supprimer le champ comment pour éviter qu'il ne soit utilisé ailleurs
          delete updateData.comment;
        }

        // Réinitialiser les informations d'approbation
        updateData.approved_by = null;
        updateData.approved_at = null;
      } else if (req.body.status === "pending") {
        // Remettre en attente - réinitialiser les informations d'approbation/rejet
        updateData.approved_by = null;
        updateData.approved_at = null;
        updateData.rejected_by = null;
        updateData.rejected_at = null;
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

    // SÉCURITÉ: Vérifier que la demande ciblée appartient bien à un employé lié à l'utilisateur connecté
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      // Récupérer l'employé associé à la demande
      const employee = await Employee.findById(vacationRequest.employee_id);

      if (!employee || employee.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Accès interdit à cette ressource." });
      }
    }

    // Vérification des permissions (employés ne peuvent supprimer que leurs propres demandes en attente)
    if (req.user.role === "employee") {
      if (vacationRequest.employee_id.toString() !== req.user.id.toString()) {
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

    // Suppression propre de la demande de congé
    await VacationRequest.delete(req.params.id);

    // Journalisation claire de l'activité
    if (global.Activity) {
      try {
        const employee = await Employee.findById(vacationRequest.employee_id);
        const employeeName = employee
          ? `${employee.first_name} ${employee.last_name}`.trim()
          : `Employé #${vacationRequest.employee_id}`;

        const description = `Suppression de la demande de congé pour ${employeeName} du ${new Date(
          vacationRequest.start_date
        ).toLocaleDateString("fr-FR")} au ${new Date(
          vacationRequest.end_date
        ).toLocaleDateString("fr-FR")}`;

        await global.Activity.logActivity({
          type: "delete",
          entity_type: "vacation",
          entity_id: req.params.id,
          description,
          user_id: req.user.id,
          details: {
            employee_id: vacationRequest.employee_id,
            employee_name: employeeName,
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
          "Erreur lors de la journalisation de l'activité:",
          logError
        );
      }
    }

    // Envoi explicite et sécurisé des notifications via WebSocket si disponible
    if (req.io) {
      try {
        await Notification.createAndBroadcast({
          user_id: vacationRequest.employee_id,
          title: "Demande de congé supprimée",
          message: `Votre demande de congé du ${new Date(
            vacationRequest.start_date
          ).toLocaleDateString("fr-FR")} au ${new Date(
            vacationRequest.end_date
          ).toLocaleDateString("fr-FR")} a été supprimée`,
          type: "warning",
          entity_type: "vacation_request",
          entity_id: req.params.id,
          link: "/vacations",
        });
        console.log("Notification envoyée avec succès à l'employé.");
      } catch (notifError) {
        console.error("Erreur lors de l'envoi de la notification:", notifError);
        // Continuer même en cas d'erreur de notification
      }
    }

    res.json({
      success: true,
      message: "Demande de congé supprimée avec succès",
    });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la demande ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la demande de congé",
      error: error.message,
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
    // Récupérer l'ID de la demande de congé à partir de l'URL
    const id = req.params.id;
    // Récupérer le nouveau statut et le commentaire de rejet du corps de la requête
    const { status, comment } = req.body;

    // Vérifier que le statut est valide
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
        details: "Le statut doit être 'pending', 'approved' ou 'rejected'",
        data: null,
      });
    }

    // Vérifier les droits d'accès (seuls les admins et les managers peuvent changer le statut)
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé",
        details:
          "Seuls les administrateurs et les managers peuvent modifier le statut des demandes de congé",
        data: null,
      });
    }

    // Récupérer la demande de congé existante
    const vacationRequest = await VacationRequest.findById(id);

    if (!vacationRequest) {
      return res.status(404).json({
        success: false,
        message: "Demande de congé non trouvée",
        details: `La demande de congé avec l'ID ${id} n'existe pas`,
        data: null,
      });
    }

    console.log(`Demande de congé trouvée:`, vacationRequest);

    // Vérifier si le statut est déjà celui demandé
    if (vacationRequest.status === status) {
      return res.json({
        success: true,
        message: `La demande de congé a déjà le statut "${status}"`,
        data: vacationRequest,
      });
    }

    // Récupérer les informations sur l'utilisateur qui approuve/rejette
    const [userResult] = await db.execute(
      "SELECT first_name, last_name FROM users WHERE id = ?",
      [req.user.id]
    );

    const approverName =
      userResult && userResult.length > 0
        ? `${userResult[0].first_name} ${userResult[0].last_name}`.trim()
        : `Utilisateur #${req.user.id}`;

    console.log(`Approbateur: ${approverName} (ID: ${req.user.id})`);

    // Récupérer les informations sur l'employé concerné
    const employee = await Employee.findById(vacationRequest.employee_id);
    const employeeName = employee
      ? `${employee.first_name} ${employee.last_name}`.trim()
      : `Employé #${vacationRequest.employee_id}`;

    console.log(
      `Employé: ${employeeName} (ID: ${vacationRequest.employee_id})`
    );

    // Préparer les données à mettre à jour
    const updateData = {
      status: status,
    };

    // Ajouter des informations supplémentaires selon le statut
    if (status === "approved") {
      // Stocker les informations sur l'approbateur
      updateData.approved_by = req.user.id; // Utiliser l'ID utilisateur au lieu du nom
      updateData.approved_at = new Date();

      // Réinitialiser les informations de rejet si la demande était précédemment rejetée
      updateData.rejected_by = null;
      updateData.rejected_at = null;
    } else if (status === "rejected") {
      // Stocker les informations sur le rejeteur
      updateData.rejected_by = req.user.id; // Utiliser l'ID utilisateur au lieu du nom
      updateData.rejected_at = new Date();

      // Si un commentaire de rejet est fourni, l'ajouter à la raison
      if (comment) {
        updateData.reason = vacationRequest.reason
          ? `${vacationRequest.reason} | Motif de rejet: ${comment}`
          : `Motif de rejet: ${comment}`;
      }

      // Réinitialiser les informations d'approbation si la demande était précédemment approuvée
      updateData.approved_by = null;
      updateData.approved_at = null;
    } else if (status === "pending") {
      // Remettre en attente - réinitialiser les informations d'approbation/rejet
      updateData.approved_by = null;
      updateData.approved_at = null;
      updateData.rejected_by = null;
      updateData.rejected_at = null;
    }

    console.log(`Données de mise à jour:`, updateData);

    try {
      // Mettre à jour le statut de la demande de congé en utilisant la méthode dédiée
      const updateResult = await VacationRequest.updateStatus(
        id,
        status,
        req.user.id, // adminId
        comment // rejectionReason
      );

      if (!updateResult) {
        console.log(`Échec de la mise à jour de la demande de congé ${id}`);
        return res.status(500).json({
          success: false,
          message:
            "Erreur lors de la mise à jour du statut de la demande de congé",
          details: "La mise à jour a échoué",
          data: null,
        });
      }

      // Récupérer la demande mise à jour
      const updatedVacationRequest = await VacationRequest.findById(id);

      console.log(
        `Demande de congé mise à jour avec succès:`,
        updatedVacationRequest
      );

      // Journaliser l'activité
      try {
        const statusText =
          status === "approved"
            ? "approuvée"
            : status === "rejected"
            ? "rejetée"
            : "mise à jour";

        // Log de l'activité
        await Activity.logActivity({
          type: "vacation_status_update",
          entity_type: "vacation",
          entity_id: id,
          user_id: req.user.id,
          description:
            status === "approved"
              ? `Demande de congés pour ${employeeName} approuvée par ${approverName}`
              : status === "rejected"
              ? `Demande de congés pour ${employeeName} rejetée par ${approverName}`
              : `Statut de la demande de congés pour ${employeeName} mis à jour par ${approverName}`,
          details: {
            previous_status: vacationRequest.status,
            new_status: status,
            comment: comment || null,
            employee_id: vacationRequest.employee_id,
            employee_name: employeeName,
            start_date: vacationRequest.start_date,
            end_date: vacationRequest.end_date,
            vacation_type: vacationRequest.type,
            approver_name: approverName,
            approver_id: req.user.id,
          },
        });

        console.log("Activité journalisée avec succès");
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité:",
          logError
        );
        // Ne pas bloquer la mise à jour si la journalisation échoue
      }

      // Créer des notifications pour tous les utilisateurs admin et managers
      try {
        console.log(
          "Début de la création des notifications pour le changement de statut"
        );

        // Récupérer tous les utilisateurs admin et managers
        const [users] = await db.execute(
          "SELECT id FROM users WHERE role IN ('admin', 'manager')"
        );

        console.log(
          `Nombre d'utilisateurs admin/manager trouvés: ${users.length}`
        );

        if (users && users.length > 0) {
          // Préparer le contenu de la notification
          const statusText =
            status === "approved"
              ? "approuvée"
              : status === "rejected"
              ? "rejetée"
              : "remise en attente";

          const notificationTitle = `Demande de congé ${statusText}`;
          const notificationMessage = `La demande de congé de ${employeeName} du ${new Date(
            vacationRequest.start_date
          ).toLocaleDateString("fr-FR")} au ${new Date(
            vacationRequest.end_date
          ).toLocaleDateString("fr-FR")} a été ${statusText}.`;
          const notificationType = "vacation_status_update";

          for (const user of users) {
            console.log(
              `Tentative de création de notification pour l'utilisateur ${user.id}`
            );

            try {
              if (!Notification || !Notification.createAndBroadcast) {
                console.error(
                  "ERREUR: Notification ou createAndBroadcast n'est pas disponible."
                );
                console.log("Type de Notification:", typeof Notification);
                console.log(
                  "Méthodes disponibles:",
                  Notification ? Object.keys(Notification) : "null"
                );
                continue;
              }

              // Utiliser createAndBroadcast au lieu de new Notification().save()
              const result = await Notification.createAndBroadcast({
                user_id: user.id,
                title: notificationTitle,
                message: notificationMessage,
                type: notificationType,
                entity_type: "vacation_request",
                entity_id: id,
                link: `/vacations/${id}`,
              });

              if (result && result.success) {
                console.log(
                  `✅ SUCCÈS: Notification créée pour l'utilisateur ${user.id} avec ID ${result.id}`
                );
                console.log("Détails:", JSON.stringify(result.notification));
              } else {
                console.error(
                  `❌ ERREUR: Échec de création de notification pour l'utilisateur ${user.id}`
                );
              }
            } catch (error) {
              console.error(
                `❌ ERREUR lors de la création de notification: ${error.message}`
              );
            }
          }
        }
      } catch (notificationError) {
        console.error(
          "Erreur lors de la création des notifications:",
          notificationError
        );
        // Ne pas bloquer la mise à jour si la création des notifications échoue
      }

      res.json({
        success: true,
        message: "Statut de la demande de congé mis à jour avec succès",
        vacationRequest: updatedVacationRequest,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      res.status(500).json({
        success: false,
        message:
          "Erreur lors de la mise à jour du statut de la demande de congé",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut de la demande de congé",
      error: error.message,
    });
  }
});

module.exports = router;
