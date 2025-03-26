const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");
const activitiesRouter = require("./activities");
const db = require("../config/db");

// @route   GET /api/employees
// @desc    Obtenir tous les employés de l'utilisateur connecté
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    console.log("Récupération des employés pour l'utilisateur connecté");

    // Récupérer l'ID de l'utilisateur connecté
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "ID d'utilisateur manquant" });
    }

    // Récupérer les employés créés par cet utilisateur
    const employees = await Employee.findByUserId(userId);

    console.log(
      `${employees.length} employés trouvés pour l'utilisateur ID: ${userId}`
    );
    res.json(employees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/employees/:id
// @desc    Obtenir un employé spécifique (de l'utilisateur connecté uniquement)
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const employeeId = req.params.id;

    // Récupérer l'employé spécifique
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Vérifier que l'employé appartient bien à l'utilisateur connecté
    if (employee.user_id !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à accéder à cet employé",
      });
    }

    res.json(employee);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'employé ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/employees
// @desc    Créer un nouvel employé (ajout automatique du user_id)
// @access  Private (Admin)
router.post("/", auth, async (req, res) => {
  try {
    console.log("Création d'un nouvel employé avec les données:", req.body);

    // Récupérer l'ID de l'admin connecté
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(400).json({ message: "ID d'administrateur manquant" });
    }

    // Normaliser les champs spécifiques (conversion camelCase en snake_case)
    const normalizedData = { ...req.body };

    // Gérer spécifiquement la conversion de zipCode en zip_code
    if (normalizedData.zipCode !== undefined) {
      normalizedData.zip_code = normalizedData.zipCode;
      delete normalizedData.zipCode;
    }

    console.log("Données normalisées pour l'employé:", normalizedData);

    // Ajouter l'ID du gestionnaire (admin connecté) aux données de l'employé
    const employeeData = {
      ...normalizedData,
      manager_id: adminId, // Associer l'employé à l'admin qui le gère
      user_id: adminId, // Associer l'employé à l'admin qui l'a créé
    };

    const employee = new Employee(employeeData);
    await employee.save();

    // Vérifier si global.Activity existe et journaliser l'activité
    if (global.Activity) {
      try {
        // Obtenir le nom complet de l'utilisateur qui a créé l'employé
        const userName =
          req.user.fullName ||
          `${req.user.first_name || ""} ${req.user.last_name || ""}`.trim() ||
          `Utilisateur #${req.user.id}`;

        // Obtenir le nom complet de l'employé créé
        const employeeName =
          `${employee.first_name} ${employee.last_name}`.trim();

        // Créer une description détaillée incluant qui a créé quel employé
        const description = `${userName} a créé un nouvel employé : ${employeeName}`;

        await global.Activity.logActivity({
          type: "create",
          entity_type: "employee",
          entity_id: employee.id,
          description: description,
          user_id: req.user.id,
          details: {
            employee_id: employee.id,
            employee_name: employeeName,
            created_by: userName,
            created_by_id: req.user.id,
            timestamp: new Date().toISOString(),
          },
        });
        console.log(`Activité de création d'employé journalisée avec succès`);
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité de création:",
          logError
        );
        // Ne pas bloquer la création si la journalisation échoue
      }
    }

    res.status(201).json(employee);
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/employees/:id
// @desc    Mettre à jour un employé (de l'utilisateur connecté uniquement)
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("Mise à jour de l'employé:", req.params.id);
    console.log("Données reçues:", JSON.stringify(req.body, null, 2));

    const userId = req.user.id;
    const employeeId = req.params.id;

    // Vérifier si l'employé appartient bien à l'utilisateur connecté
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      console.log(`Employé non trouvé: ${employeeId}`);
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    console.log("Employé trouvé:", {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      user_id: employee.user_id,
      manager_id: employee.manager_id,
    });

    // Vérifier que l'employé a été créé par l'utilisateur connecté
    if (employee.user_id !== userId) {
      console.log(
        `Accès non autorisé - User ID: ${userId}, Employee.user_id: ${employee.user_id}`
      );
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cet employé",
      });
    }

    // Normaliser les champs spécifiques (conversion camelCase en snake_case)
    const normalizedData = { ...req.body };

    // Gérer spécifiquement la conversion de zipCode en zip_code
    if (normalizedData.zipCode !== undefined) {
      normalizedData.zip_code = normalizedData.zipCode;
      delete normalizedData.zipCode;
    }

    // S'assurer que contractHours est un nombre (pas une chaîne)
    if (normalizedData.contractHours !== undefined) {
      normalizedData.contractHours =
        parseFloat(normalizedData.contractHours) || 35;
    }

    console.log(
      "Données normalisées pour la mise à jour de l'employé:",
      JSON.stringify(normalizedData, null, 2)
    );

    // Mettre à jour l'employé en conservant son user_id et manager_id
    const updateData = {
      ...normalizedData,
      user_id: userId, // S'assurer que user_id reste associé à l'utilisateur actuel
      manager_id: employee.manager_id || userId, // Conserver le manager_id existant ou utiliser userId
    };

    console.log(
      "Données finales pour mise à jour:",
      JSON.stringify(updateData, null, 2)
    );

    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(
        employeeId,
        updateData
      );

      console.log("Mise à jour réussie pour l'employé:", updatedEmployee.id);
      res.json(updatedEmployee);
    } catch (updateError) {
      console.error("Erreur détaillée lors de la mise à jour:", updateError);
      console.error("Message:", updateError.message);
      console.error("Stack:", updateError.stack);
      return res.status(500).json({
        message: "Erreur lors de la mise à jour de l'employé",
        error: updateError.message,
      });
    }

    // Journaliser l'activité si global.Activity existe
    if (global.Activity) {
      try {
        await global.Activity.logActivity({
          type: "update",
          entity_type: "employee",
          entity_id: employeeId,
          description: `Mise à jour de l'employé ${employee.first_name} ${employee.last_name}`,
          user_id: userId,
          details: {
            employee_id: employeeId,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            updated_by_id: userId,
          },
        });
        console.log(
          `Activité de mise à jour d'employé journalisée avec succès`
        );
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité de mise à jour:",
          logError
        );
        // Ne pas bloquer la mise à jour si la journalisation échoue
      }
    }
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'employé ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Supprimer un employé (de l'utilisateur connecté uniquement)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const employeeId = req.params.id;

    // Vérifier si l'employé appartient bien à l'utilisateur connecté
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Vérifier que l'employé a été créé par l'utilisateur connecté
    if (employee.user_id !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cet employé",
      });
    }

    // Supprimer l'employé
    await Employee.delete(employeeId);

    // Journaliser l'activité si global.Activity existe
    if (global.Activity) {
      try {
        // Obtenir le nom complet de l'utilisateur qui a supprimé l'employé
        const userName =
          req.user.fullName ||
          `${req.user.first_name || ""} ${req.user.last_name || ""}`.trim() ||
          `Utilisateur #${req.user.id}`;

        // Obtenir le nom complet de l'employé supprimé
        const employeeName =
          `${employee.first_name} ${employee.last_name}`.trim();

        // Créer une description détaillée incluant qui a supprimé quel employé
        const description = `${userName} a supprimé l'employé : ${employeeName}`;

        await global.Activity.logActivity({
          type: "delete",
          entity_type: "employee",
          entity_id: employeeId,
          description: description,
          user_id: userId,
          details: {
            employee_id: employeeId,
            employee_name: employeeName,
            deleted_by: userName,
            deleted_by_id: userId,
            timestamp: new Date().toISOString(),
          },
        });
        console.log(
          `Activité de suppression d'employé journalisée avec succès`
        );
      } catch (logError) {
        console.error(
          "Erreur lors de la journalisation de l'activité de suppression:",
          logError
        );
        // Ne pas bloquer la suppression si la journalisation échoue
      }
    }

    res.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'employé ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer tous les employés associés à un utilisateur
router.get("/by-user/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Vérifier que l'utilisateur a accès à cette information
    if (req.user.id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas l'autorisation d'accéder à ces données",
      });
    }

    // Récupérer les employés associés à cet utilisateur
    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email FROM employees WHERE user_id = ?",
      [userId]
    );

    // Si aucun employé n'est trouvé, retourner un tableau vide
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "Aucun employé associé à cet utilisateur",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Employés récupérés avec succès",
      data: rows,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des employés par utilisateur:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des employés",
      error: error.message,
    });
  }
});

module.exports = router;
