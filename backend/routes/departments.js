const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");
const { checkRole } = require("../middleware/secureAuth");
const { recordActivity } = require("./activities");
const db = require("../config/db");

/**
 * @route   GET /api/departments/test
 * @desc    Route de test pour vérifier si le routeur fonctionne
 * @access  Public
 */
router.get("/test", (req, res) => {
  console.log("Route GET /api/departments/test appelée");
  res.json({ message: "Route de test des départements fonctionnelle" });
});

/**
 * @route   GET /api/departments
 * @desc    Récupérer tous les départements de l'utilisateur connecté
 * @access  Private
 */
router.get("/", auth, async (req, res) => {
  console.log("Route GET /api/departments appelée");

  try {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "ID d'utilisateur manquant" });
    }

    console.log(
      `Récupération des départements pour l'utilisateur ID: ${userId}`
    );

    // Récupérer les départements de l'utilisateur
    const departments = await Department.findByUserId(userId);

    console.log(
      `${departments.length} départements trouvés pour l'utilisateur`
    );
    res.json(departments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des départements",
    });
  }
});

/**
 * @route   GET /api/departments/:id
 * @desc    Récupérer un département par son ID (appartenant à l'utilisateur connecté)
 * @access  Private
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const departmentId = req.params.id;

    // Récupérer le département
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Département non trouvé" });
    }

    // Vérifier que le département appartient à l'utilisateur connecté
    if (department.user_id !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à accéder à ce département",
      });
    }

    res.json(department);
  } catch (error) {
    console.error("Erreur lors de la récupération du département:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @route   GET /api/departments/:id/employees
 * @desc    Récupérer les employés d'un département
 * @access  Private
 */
router.get("/:id/employees", auth, async (req, res) => {
  console.log(`Route GET /api/departments/${req.params.id}/employees appelée`);

  try {
    const departmentId = req.params.id;
    console.log(
      `Récupération des employés pour le département ID: ${departmentId}`
    );

    // Convertir l'ID en nom de département (en remplaçant les tirets par des espaces)
    const departmentName = departmentId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    console.log(`Nom du département: ${departmentName}`);

    // Récupérer les employés du département
    const [employees] = await db.query(
      "SELECT * FROM employees WHERE department = ?",
      [departmentName]
    );

    console.log(
      `${employees.length} employés trouvés pour le département ${departmentName}`
    );
    res.json(employees);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des employés du département ${req.params.id}:`,
      error
    );
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des employés du département",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/departments
 * @desc    Créer un nouveau département
 * @access  Private
 */
router.post("/", auth, async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "ID d'utilisateur manquant" });
    }

    // Ajouter l'ID de l'utilisateur aux données du département
    const departmentData = {
      ...req.body,
      user_id: userId, // Associer le département à l'utilisateur qui le crée
    };

    // Créer le département
    const department = new Department(departmentData);
    await department.save();

    // Journaliser l'activité
    if (global.Activity) {
      try {
        await global.Activity.logActivity({
          type: "create",
          entity_type: "department",
          entity_id: department.id,
          description: `Création du département ${department.name}`,
          user_id: userId,
          details: {
            department_id: department.id,
            department_name: department.name,
          },
        });
      } catch (logError) {
        console.error("Erreur lors de la journalisation:", logError);
      }
    }

    res.status(201).json(department);
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @route   PUT /api/departments/:id
 * @desc    Mettre à jour un département
 * @access  Private (Admin)
 */
router.put("/:id", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;

    // Vérifier si le département existe
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Département non trouvé",
      });
    }

    // Vérifier si le nom est déjà utilisé par un autre département
    if (name && name !== department.name) {
      const existingDepartment = await Department.findByName(name);
      if (
        existingDepartment &&
        existingDepartment.id !== parseInt(req.params.id)
      ) {
        return res.status(409).json({
          success: false,
          message: "Un département avec ce nom existe déjà",
        });
      }
    }

    // Mettre à jour le département
    const updatedDepartment = await Department.update(req.params.id, {
      name: name || department.name,
      description:
        description !== undefined ? description : department.description,
      manager_id: manager_id !== undefined ? manager_id : department.manager_id,
    });

    // Enregistrer l'activité
    try {
      await recordActivity({
        type: "update",
        entity_type: "department",
        entity_id: updatedDepartment.id,
        description: `Mise à jour du département ${updatedDepartment.name}`,
        user_id: req.user.id,
        details: {
          department_id: updatedDepartment.id,
          department_name: updatedDepartment.name,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
    }

    res.json({
      success: true,
      message: "Département mis à jour avec succès",
      department: updatedDepartment,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du département ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du département",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/departments/:id
 * @desc    Supprimer un département
 * @access  Private (Admin)
 */
router.delete("/:id", auth, checkRole(["admin"]), async (req, res) => {
  try {
    // Vérifier si le département existe
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Département non trouvé",
      });
    }

    // Supprimer le département
    const deleted = await Department.delete(req.params.id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du département",
      });
    }

    // Enregistrer l'activité
    try {
      await recordActivity({
        type: "delete",
        entity_type: "department",
        entity_id: req.params.id,
        description: `Suppression du département ${department.name}`,
        user_id: req.user.id,
        details: {
          department_id: req.params.id,
          department_name: department.name,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
    }

    res.json({
      success: true,
      message: "Département supprimé avec succès",
    });
  } catch (error) {
    console.error(
      `Erreur lors de la suppression du département ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du département",
      error: error.message,
    });
  }
});

module.exports = router;
