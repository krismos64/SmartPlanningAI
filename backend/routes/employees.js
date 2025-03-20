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
    const userId = req.user.id; // ID du manager connecté

    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE user_id = ?",
      [userId]
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
    const userId = req.user.id;
    const employeeId = req.params.id;

    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE id = ? AND user_id = ?",
      [employeeId, userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    res.json(employees[0]);
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
    const { first_name, last_name, email, phone, role, department } = req.body;

    // Obtenir l'ID utilisateur strictement du token auth
    // Ne pas utiliser de fallback avec ID 6
    const userId = req.user?.id || req.userId;

    // Débogage
    console.log("=== CRÉATION EMPLOYÉ ===");
    console.log("User info disponible:", req.user ? "OUI" : "NON");
    console.log("User ID from req.user:", req.user?.id);
    console.log("User ID from req.userId:", req.userId);
    console.log("User ID final utilisé:", userId);
    console.log("Token info:", req.tokenInfo);
    console.log("User object:", JSON.stringify(req.user, null, 2));
    console.log("=======================");

    // Vérification stricte de l'ID utilisateur
    if (!userId) {
      console.error(
        "ERREUR: Impossible de récupérer l'ID utilisateur pour la création d'employé"
      );
      return res.status(401).json({
        message:
          "Session invalide ou expirée. Veuillez vous reconnecter pour créer un employé.",
        error: "NO_USER_ID",
      });
    }

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ message: "Le prénom et le nom sont obligatoires" });
    }

    // Log de débogage SQL
    console.log("Requête SQL pour insertion d'employé avec user_id:", userId);

    const [result] = await db.execute(
      `INSERT INTO employees (first_name, last_name, email, phone, role, department, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, role, department, userId]
    );

    const employeeId = result.insertId;

    // Enregistrer l'activité
    await activitiesRouter.recordActivity({
      type: "create",
      entity_type: "employee",
      entity_id: employeeId.toString(),
      description: `Création de l'employé ${first_name} ${last_name}`,
      user_id: userId,
      details: {
        employeeId,
        first_name,
        last_name,
        department,
        action: "création",
      },
    });

    res.status(201).json({ message: "Employé créé avec succès", employeeId });
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
    const userId = req.user.id;
    const employeeId = req.params.id;
    const { first_name, last_name, email, phone, role, department } = req.body;

    // Vérifier si l'employé appartient bien au manager
    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE id = ? AND user_id = ?",
      [employeeId, userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    await db.execute(
      `UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, department = ? 
       WHERE id = ? AND user_id = ?`,
      [
        first_name,
        last_name,
        email,
        phone,
        role,
        department,
        employeeId,
        userId,
      ]
    );

    // Enregistrer l'activité
    await activitiesRouter.recordActivity({
      type: "update",
      entity_type: "employee",
      entity_id: employeeId.toString(),
      description: `Mise à jour de l'employé ${first_name} ${last_name}`,
      user_id: userId,
      details: {
        employeeId,
        first_name,
        last_name,
        department,
        action: "mise à jour",
      },
    });

    res.json({ message: "Employé mis à jour avec succès" });
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
    const userId = req.user.id;
    const employeeId = req.params.id;

    // Vérifier si l'employé appartient bien au manager
    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE id = ? AND user_id = ?",
      [employeeId, userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    await db.execute("DELETE FROM employees WHERE id = ? AND user_id = ?", [
      employeeId,
      userId,
    ]);

    // Enregistrer l'activité
    await activitiesRouter.recordActivity({
      type: "delete",
      entity_type: "employee",
      entity_id: employeeId.toString(),
      description: `Suppression de l'employé ${employees[0].first_name} ${employees[0].last_name}`,
      user_id: userId,
      details: {
        employeeId,
        first_name: employees[0].first_name,
        last_name: employees[0].last_name,
        action: "suppression",
      },
    });

    res.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
