// routes/employees.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { auth, checkRole } = require("../middleware/auth");
const activitiesRouter = require("./activities");
const db = require("../config/db");

// @route   GET /api/employees
// @desc    Obtenir tous les employés
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des employés" });
  }
});

// @route   GET /api/employees/:id
// @desc    Obtenir un employé par ID
// @access  Public
router.get("/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'employé ${req.params.id}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'employé" });
  }
});

// @route   POST /api/employees
// @desc    Créer un nouvel employé
// @access  Private (Admin)
router.post("/", auth, async (req, res) => {
  try {
    const employeeData = req.body;

    // Validation des données
    if (!employeeData.first_name || !employeeData.last_name) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le prénom et le nom de l'employé",
      });
    }

    // Créer l'employé
    const employee = new Employee(employeeData);
    await employee.save();

    // L'ID est maintenant disponible dans l'objet employee
    const employeeId = employee.id;

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité de création pour l'employé:",
        {
          id: employeeId,
          name: `${employeeData.first_name} ${employeeData.last_name}`,
          userId: req.user.id,
        }
      );

      await activitiesRouter.recordActivity({
        type: "create",
        entity_type: "employee",
        entity_id: employeeId.toString(), // Convertir en string pour assurer la compatibilité
        description: `Création de l'employé ${employeeData.first_name} ${employeeData.last_name}`,
        user_id: req.user.id,
        details: {
          employeeId: employeeId,
          employeeName: `${employeeData.first_name} ${employeeData.last_name}`,
          department: employeeData.department || "Non spécifié",
          action: "création",
        },
      });

      console.log("Activité de création enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      console.error("Stack trace:", activityError.stack);
      // On continue malgré l'erreur d'activité
    }

    res.status(201).json({
      success: true,
      message: "Employé créé avec succès",
      employee: employee,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'employé",
      error: error.message,
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Mettre à jour un employé
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    // Récupérer l'employé avant la mise à jour pour avoir les anciennes valeurs
    const oldEmployee = await Employee.findById(req.params.id);
    if (!oldEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      });
    }

    // Mettre à jour l'employé
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité de mise à jour pour l'employé:",
        {
          id: updatedEmployee.id,
          name: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
          userId: req.user.id,
        }
      );

      // Déterminer les changements
      const changes = {};
      if (oldEmployee.department !== updatedEmployee.department) {
        changes.department = {
          old: oldEmployee.department || "Non spécifié",
          new: updatedEmployee.department || "Non spécifié",
        };
      }
      if (oldEmployee.role !== updatedEmployee.role) {
        changes.role = {
          old: oldEmployee.role || "Non spécifié",
          new: updatedEmployee.role || "Non spécifié",
        };
      }

      await activitiesRouter.recordActivity({
        type: "update",
        entity_type: "employee",
        entity_id: updatedEmployee.id.toString(),
        description: `Mise à jour de l'employé ${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
        user_id: req.user.id,
        details: {
          employeeId: updatedEmployee.id,
          employeeName: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
          department: updatedEmployee.department || "Non spécifié",
          changes: changes,
          action: "mise à jour",
        },
      });

      console.log("Activité de mise à jour enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      console.error("Stack trace:", activityError.stack);
      // On continue malgré l'erreur d'activité
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'employé ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'employé",
      error: error.message,
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Supprimer un employé
// @access  Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    // Vérifier si l'employé existe
    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      });
    }

    const employee = employees[0];
    const employeeName = `${employee.first_name} ${employee.last_name}`.trim();
    const employeeDepartment = employee.department || "Non spécifié";

    // Supprimer l'employé
    await db.execute("DELETE FROM employees WHERE id = ?", [id]);

    // Enregistrer l'activité
    try {
      console.log(
        "Tentative d'enregistrement de l'activité de suppression pour l'employé:",
        {
          id,
          name: employeeName,
          userId: req.user.id,
        }
      );

      await activitiesRouter.recordActivity({
        type: "delete",
        entity_type: "employee",
        entity_id: id,
        description: `Suppression de l'employé ${employeeName}`,
        user_id: req.user.id,
        details: {
          employeeId: employee.id,
          employeeName: employeeName,
          department: employeeDepartment,
          action: "suppression",
        },
      });

      console.log("Activité de suppression enregistrée avec succès");
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      console.error("Stack trace:", activityError.stack);
      // On continue malgré l'erreur d'activité
    }

    res.json({
      success: true,
      message: "Employé supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'employé",
      error: error.message,
    });
  }
});

module.exports = router;
