const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee.js");
const Planning = require("../models/Planning.js");
const VacationRequest = require("../models/VacationRequest.js");

router.get("/dashboard", async (req, res) => {
  try {
    const employees = await Employee.find();
    const totalHours = employees.reduce((acc, emp) => acc + emp.workedHours, 0);
    const overtimeEmployees = employees.filter(
      (emp) => emp.workedHours > emp.contractHours
    ).length;

    res.json({
      totalEmployees: employees.length,
      totalHours,
      averageHours: totalHours / employees.length,
      overtimeEmployees,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    const plannings = await Planning.find({
      "schedules.shifts.employee": req.params.id,
    });

    // Calcul des statistiques de l'employé
    const stats = {
      totalHours: employee.workedHours,
      overtime: Math.max(0, employee.workedHours - employee.contractHours),
      shiftsCount: plannings.reduce(
        (acc, planning) =>
          acc +
          planning.schedules.reduce(
            (acc2, schedule) =>
              acc2 +
              schedule.shifts.filter(
                (shift) => shift.employee.toString() === req.params.id
              ).length,
            0
          ),
        0
      ),
    };

    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

router.get("/workload", async (req, res) => {
  try {
    // Logique pour calculer la charge de travail
    const workloadData = await Planning.aggregate([
      // ... agrégation MongoDB ...
    ]);
    res.json(workloadData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/distribution", async (req, res) => {
  try {
    const distribution = await Employee.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(distribution);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/vacations", async (req, res) => {
  try {
    const vacations = await VacationRequest.aggregate([
      // ... agrégation MongoDB ...
    ]);
    res.json(vacations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

router.get("/overtime", async (req, res) => {
  try {
    const overtime = await Employee.aggregate([
      // ... agrégation MongoDB ...
    ]);
    res.json(overtime);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

module.exports = router;
