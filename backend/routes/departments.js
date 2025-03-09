const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const { auth, checkRole } = require("../middleware/auth");
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
 * @desc    Récupérer tous les départements
 * @access  Public
 */
router.get("/", async (req, res) => {
  console.log("Route GET /api/departments appelée");

  try {
    // Version simplifiée pour déboguer
    console.log(
      "Récupération des départements directement depuis la base de données"
    );

    // Vérifier la connexion à la base de données
    try {
      await db.query("SELECT 1");
      console.log("Connexion à la base de données vérifiée avec succès");
    } catch (dbError) {
      console.error("Erreur de connexion à la base de données:", dbError);
      return res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: dbError.message,
      });
    }

    const [departments] = await db.query(
      "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL"
    );

    console.log("Départements trouvés:", departments);

    // Transformer en format simplifié
    const formattedDepartments = departments.map((dept) => ({
      id: dept.department.toLowerCase().replace(/\s+/g, "-"),
      name: dept.department,
    }));

    console.log("Départements formatés:", formattedDepartments);
    res.json(formattedDepartments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des départements",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/departments/:id
 * @desc    Récupérer un département par son ID
 * @access  Private
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Département non trouvé",
      });
    }

    res.json({
      success: true,
      department,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du département ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du département",
      error: error.message,
    });
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
 * @access  Private (Admin)
 */
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;

    // Vérifier si le nom est fourni
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le nom du département est requis",
      });
    }

    // Vérifier si le département existe déjà
    const existingDepartment = await Department.findByName(name);
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Un département avec ce nom existe déjà",
      });
    }

    // Créer le département
    const department = await Department.create({
      name,
      description,
      manager_id,
    });

    // Enregistrer l'activité
    try {
      await recordActivity({
        type: "create",
        entity_type: "department",
        entity_id: department.id,
        description: `Création du département ${department.name}`,
        user_id: req.user.id,
        details: {
          department_id: department.id,
          department_name: department.name,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
    }

    res.status(201).json({
      success: true,
      message: "Département créé avec succès",
      department,
    });
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du département",
      error: error.message,
    });
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
