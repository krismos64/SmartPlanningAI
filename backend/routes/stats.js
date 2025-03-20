const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee.js");
const VacationRequest = require("../models/VacationRequest.js");
const connectDB = require("../config/db");

router.get("/dashboard", async (req, res) => {
  try {
    const employees = await Employee.find();

    // Calcul des heures contractuelles et du nombre d'employés en heures supplémentaires
    let totalContractHours = 0;
    let overtimeEmployees = 0;

    employees.forEach((emp) => {
      totalContractHours += emp.contractHours || 0;
      if (emp.hour_balance > 0) {
        overtimeEmployees++;
      }
    });

    res.json({
      totalEmployees: employees.length,
      totalContractHours,
      averageHours: employees.length
        ? totalContractHours / employees.length
        : 0,
      overtimeEmployees,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Récupérer les horaires hebdomadaires de l'employé
    const [weeklySchedules] = await connectDB.execute(
      "SELECT * FROM weekly_schedules WHERE employee_id = ? ORDER BY week_start DESC LIMIT 10",
      [req.params.id]
    );

    // Calculer les statistiques de l'employé
    const stats = {
      contractHours: employee.contractHours || 0,
      hourBalance: employee.hour_balance || 0,
      shiftsCount: weeklySchedules.length,
      lastSchedules: weeklySchedules.map((schedule) => ({
        weekStart: schedule.week_start,
        weekEnd: schedule.week_end,
        totalHours: schedule.total_hours,
        status: schedule.status,
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

router.get("/workload", async (req, res) => {
  try {
    // Récupérer la charge de travail des dernières semaines
    const [workloadData] = await connectDB.execute(`
      SELECT 
        DATE_FORMAT(week_start, '%Y-%m-%d') as week,
        SUM(total_hours) as total_hours,
        COUNT(DISTINCT employee_id) as employee_count
      FROM weekly_schedules
      WHERE week_start >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY week_start
      ORDER BY week_start ASC
    `);

    res.json(workloadData);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de charge de travail:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/distribution", async (req, res) => {
  try {
    // Récupérer la distribution des employés par rôle
    const [distribution] = await connectDB.execute(`
      SELECT 
        role as name,
        COUNT(*) as count
      FROM employees
      WHERE role IS NOT NULL AND role != ''
      GROUP BY role
    `);

    res.json(distribution);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la distribution des rôles:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/vacations", async (req, res) => {
  try {
    // Récupérer les statistiques des congés
    const [vacations] = await connectDB.execute(`
      SELECT 
        type,
        status,
        COUNT(*) as count,
        SUM(duration) as total_days
      FROM vacation_requests
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY type, status
    `);

    res.json(vacations);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de congés:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/overtime", async (req, res) => {
  try {
    // Récupérer les statistiques des heures supplémentaires
    const [overtime] = await connectDB.execute(`
      SELECT 
        e.department,
        COUNT(e.id) as employee_count,
        SUM(w.balance) as total_balance
      FROM employees e
      JOIN work_hours w ON e.id = w.employee_id
      WHERE w.balance > 0
      GROUP BY e.department
    `);

    res.json(overtime);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques d'heures supplémentaires:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

module.exports = router;
