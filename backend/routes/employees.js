const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");
const activitiesRouter = require("./activities");
const db = require("../config/db");

// @route   GET /api/employees
// @desc    Obtenir tous les employés du manager connecté
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    console.log("Récupération des employés pour l'admin connecté");

    // Récupérer l'ID de l'admin connecté
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(400).json({ message: "ID d'administrateur manquant" });
    }

    // Récupérer uniquement les employés gérés par cet admin
    const employees = await Employee.findByManager(adminId);

    console.log(
      `${employees.length} employés trouvés pour l'admin ID: ${adminId}`
    );
    res.json(employees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/employees/:id
// @desc    Obtenir un employé spécifique (du manager connecté uniquement)
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const adminId = req.user.id;
    const employeeId = req.params.id;

    // Récupérer l'employé spécifique
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Vérifier que l'employé est bien géré par l'admin connecté
    if (employee.manager_id !== adminId) {
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

    // Ajouter l'ID du gestionnaire (admin connecté) aux données de l'employé
    const employeeData = {
      ...req.body,
      manager_id: adminId, // Associer l'employé à l'admin qui le crée
    };

    const employee = new Employee(employeeData);
    await employee.save();

    // Vérifier si global.Activity existe et journaliser l'activité
    if (global.Activity) {
      try {
        await global.Activity.logActivity({
          type: "create",
          entity_type: "employee",
          entity_id: employee.id,
          description: `Création de l'employé ${employee.first_name} ${employee.last_name}`,
          user_id: req.user.id,
          details: {
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
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
// @desc    Mettre à jour un employé (du manager connecté uniquement)
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const adminId = req.user.id;
    const employeeId = req.params.id;

    // Vérifier si l'employé appartient bien au manager connecté
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Vérifier que l'employé est bien géré par l'admin connecté
    if (employee.manager_id !== adminId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cet employé",
      });
    }

    // Mettre à jour l'employé en conservant son manager_id
    const updateData = {
      ...req.body,
      manager_id: adminId, // S'assurer que manager_id reste inchangé
    };

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData
    );

    // Journaliser l'activité si global.Activity existe
    if (global.Activity) {
      try {
        await global.Activity.logActivity({
          type: "update",
          entity_type: "employee",
          entity_id: employeeId,
          description: `Mise à jour de l'employé ${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
          user_id: adminId,
          details: {
            employee_id: employeeId,
            employee_name: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
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

    res.json(updatedEmployee);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'employé ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Supprimer un employé (du manager connecté uniquement)
// @access  Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const adminId = req.user.id;
    const employeeId = req.params.id;

    // Vérifier si l'employé appartient bien au manager connecté
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Vérifier que l'employé est bien géré par l'admin connecté
    if (employee.manager_id !== adminId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cet employé",
      });
    }

    // Supprimer l'employé
    await Employee.delete(employeeId);

    // Journaliser l'activité si global.Activity existe
    if (global.Activity) {
      try {
        await global.Activity.logActivity({
          type: "delete",
          entity_type: "employee",
          entity_id: employeeId,
          description: `Suppression de l'employé ${employee.first_name} ${employee.last_name}`,
          user_id: adminId,
          details: {
            employee_id: employeeId,
            employee_name: `${employee.first_name} ${employee.last_name}`,
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

module.exports = router;
