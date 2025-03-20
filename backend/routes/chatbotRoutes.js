/**
 * Routes pour le chatbot basé sur des règles
 * Gère les requêtes liées au traitement des messages et aux réponses préconfigurées
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { findMatchingRule } = require("../services/chatbotRules");
const scheduleOptimizer = require("../services/scheduleOptimizer");

// Middleware d'authentification
router.use(auth);

/**
 * @route   POST /api/chatbot/process
 * @desc    Traiter un message utilisateur avec le système de règles
 * @access  Private
 */
router.post("/process", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    console.log("User ID reçu dans le chatbot :", userId);

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message requis" });
    }

    console.log(
      `Traitement du message avec le système de règles: "${message.substring(
        0,
        50
      )}..."`
    );

    // Traiter le message avec le système de règles
    const result = await findMatchingRule(message, userId);

    // Format de réponse
    const response = {
      success: true,
      intent: result.intent || "MATCHED_RULE",
      score: 1.0,
      message: result.text || result.error ? "Erreur de traitement" : "",
      entities: {},
      actions: result.actions || [],
      error: result.error || false,
    };

    res.json(response);
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du message",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/chatbot/generate-schedule
 * @desc    Générer un planning optimisé
 * @access  Private
 */
router.post("/generate-schedule", async (req, res) => {
  try {
    const {
      week_start,
      department_id,
      min_hours_per_employee,
      max_hours_per_employee,
      opening_hours,
      employee_ids,
      priority_rules,
    } = req.body;

    // Vérifier les paramètres obligatoires
    if (!week_start) {
      return res.status(400).json({
        success: false,
        message: "Date de début de semaine requise",
      });
    }

    console.log(
      `Demande de génération de planning IA pour la semaine du ${week_start}`
    );

    // Générer le planning avec l'optimiseur
    const result = await scheduleOptimizer.generateOptimizedSchedule({
      weekStart: week_start,
      departmentId: department_id,
      minHoursPerEmployee: min_hours_per_employee,
      maxHoursPerEmployee: max_hours_per_employee,
      openingHours: opening_hours,
      employeeIds: employee_ids,
      priorityRules: priority_rules,
    });

    // Enregistrer l'activité de génération
    try {
      const { recordActivity } = require("./activities");
      await recordActivity({
        type: "ai_generate",
        entity_type: "planning",
        entity_id: "optimized_schedule",
        description: `Génération IA d'un planning pour la semaine du ${week_start}`,
        user_id: req.user ? req.user.id : null,
        details: {
          week_start,
          department_id,
          employee_count: employee_ids ? employee_ids.length : "tous",
          stats: result.stats,
        },
      });
    } catch (activityError) {
      console.error(
        "Erreur lors de l'enregistrement de l'activité:",
        activityError
      );
      // Continuer malgré l'erreur d'activité
    }

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la génération du planning IA:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du planning",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/user-stats
 * @desc    Obtenir des statistiques personnalisées pour l'utilisateur
 * @access  Private
 */
router.get("/user-stats", async (req, res) => {
  try {
    const userId = req.user.id;
    const connectDB = require("../config/db");

    // Récupérer les statistiques réelles de l'utilisateur à partir de la base de données
    const [vacationStats] = await connectDB.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM vacation_requests 
         WHERE employee_id = ? AND status = 'approved' AND start_date >= CURDATE()) AS upcoming_vacations,
        (SELECT SUM(duration) FROM vacation_requests 
         WHERE employee_id = ? AND status = 'approved' AND 
         YEAR(start_date) = YEAR(CURDATE())) AS used_vacations_this_year
    `,
      [userId, userId]
    );

    const [workStats] = await connectDB.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM weekly_schedule_entries wse 
         JOIN weekly_schedules ws ON wse.schedule_id = ws.id
         WHERE ws.employee_id = ? AND ws.start_date <= CURDATE() AND ws.end_date >= CURDATE()) AS shifts_this_week
    `,
      [userId]
    );

    const [employeeData] = await connectDB.execute(
      `
      SELECT vacation_balance FROM employees WHERE id = ?
    `,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        upcoming_vacations: vacationStats[0].upcoming_vacations || 0,
        used_vacations_this_year:
          vacationStats[0].used_vacations_this_year || 0,
        remaining_vacation_days: employeeData[0]?.vacation_balance || 0,
        shifts_this_week: workStats[0].shifts_this_week || 0,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
});

// Middleware pour vérifier si l'utilisateur est admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Accès restreint aux administrateurs",
    });
  }
  next();
};

/**
 * @route   GET /api/chatbot/absences/today
 * @desc    Obtenir la liste des personnes qui ne travaillent pas aujourd'hui
 * @access  Admin only
 */
router.get("/absences/today", adminOnly, async (req, res) => {
  try {
    console.log(
      "Requête pour les personnes qui ne travaillent pas aujourd'hui"
    );
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Date du jour formatée pour SQL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];
    const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = lundi, 1 = mardi, ..., 6 = dimanche

    // Solution temporaire avec des données simulées
    const [departments] = await connectDB.execute(
      "SELECT name FROM departments LIMIT 3"
    );
    const departmentNames = departments.map((d) => d.name);

    // Créer une liste statique d'employés absents aujourd'hui
    const absencesToday = [
      {
        name: "Marie Dupont",
        department: departmentNames[0] || "Caisses",
        reason: "congé",
      },
      {
        name: "Jean Michel",
        department: departmentNames[0] || "Caisses",
        reason: "repos",
      },
      {
        name: "Sophie Marceau",
        department: departmentNames[1] || "Informatique",
        reason: "congé",
      },
      {
        name: "Didier Deschamps",
        department: departmentNames[2] || "Boutique",
        reason: "repos",
      },
      {
        name: "Céline Dion",
        department: departmentNames[2] || "Boutique",
        reason: "non programmé",
      },
    ];

    console.log(
      `Solution temporaire : retour de ${absencesToday.length} employés absents aujourd'hui`
    );

    res.json({
      success: true,
      data: absencesToday,
      metadata: {
        today: todayFormatted,
        day_index: dayIndex,
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des absences:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des absences",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/vacations/upcoming
 * @desc    Obtenir la liste des prochains congés
 * @access  Admin only
 */
router.get("/vacations/upcoming", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les prochains congés");
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Solution temporaire avec des données simulées
    const [departments] = await connectDB.execute(
      "SELECT name FROM departments LIMIT 3"
    );
    const departmentNames = departments.map((d) => d.name);

    // Créer une liste statique des prochains congés
    const upcomingVacations = [
      {
        name: "Marie Dupont",
        department: departmentNames[0] || "Caisses",
        start_date: "25/03/2025",
        end_date: "02/04/2025",
      },
      {
        name: "Sophie Marceau",
        department: departmentNames[1] || "Informatique",
        start_date: "01/04/2025",
        end_date: "15/04/2025",
      },
      {
        name: "Quentin Tarantino",
        department: departmentNames[0] || "Caisses",
        start_date: "05/04/2025",
        end_date: "12/04/2025",
      },
      {
        name: "Didier Deschamps",
        department: departmentNames[2] || "Boutique",
        start_date: "10/04/2025",
        end_date: "17/04/2025",
      },
    ];

    console.log(
      `Solution temporaire : retour de ${upcomingVacations.length} prochains congés`
    );

    res.json({
      success: true,
      data: upcomingVacations,
      metadata: {
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des congés:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des congés",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/schedules/missing
 * @desc    Obtenir la liste des départements sans planning pour la semaine prochaine
 * @access  Private
 */
router.get("/schedules/missing", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les plannings manquants");
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Calculer la date de début de la semaine prochaine (lundi)
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((7 - today.getDay() + 1) % 7) || 7);
    nextMonday.setHours(0, 0, 0, 0);

    const nextMondayFormatted = nextMonday.toISOString().split("T")[0];

    // Solution temporaire avec des données simulées
    const missingSchedules = [
      { id: 1, name: "Boucherie" },
      { id: 3, name: "Restaurant" },
      { id: 5, name: "Service clients" },
    ];

    console.log(
      `Solution temporaire : retour de ${missingSchedules.length} départements sans planning pour la semaine prochaine`
    );

    res.json({
      success: true,
      data: missingSchedules,
      metadata: {
        nextMonday: nextMondayFormatted,
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des plannings manquants:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification des plannings manquants",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/hours/negative
 * @desc    Obtenir la liste des employés avec un solde d'heures négatif
 * @access  Admin only
 */
router.get("/hours/negative", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les soldes d'heures négatifs");
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Solution temporaire avec des données simulées
    const [departments] = await connectDB.execute(
      "SELECT name FROM departments LIMIT 3"
    );
    const departmentNames = departments.map((d) => d.name);

    // Créer une liste statique d'employés avec solde négatif
    const negativeBalances = [
      {
        name: "Pierre Martin",
        department: departmentNames[2] || "Boutique",
        balance: "-1.50",
      },
      {
        name: "Jean Michel",
        department: departmentNames[0] || "Caisses",
        balance: "-3.25",
      },
      {
        name: "Marie Dupont",
        department: departmentNames[0] || "Caisses",
        balance: "-0.75",
      },
      {
        name: "Didier Deschamps",
        department: departmentNames[1] || "Informatique",
        balance: "-2.00",
      },
    ];

    console.log(
      `Solution temporaire : retour de ${negativeBalances.length} employés avec solde négatif`
    );

    res.json({
      success: true,
      data: negativeBalances,
      metadata: {
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des soldes d'heures négatifs:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des soldes d'heures négatifs",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/employees/working-today
 * @desc    Obtenir la liste des employés qui travaillent aujourd'hui
 * @access  Admin only
 */
router.get("/employees/working-today", adminOnly, async (req, res) => {
  try {
    console.log(
      "Récupération des employés qui travaillent aujourd'hui (admin)"
    );
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Date du jour formatée pour SQL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // Déterminer l'index du jour pour l'accès aux données JSON
    const dayOfWeek = today.getDay(); // JS: 0=Dim, 1=Lun, ..., 4=Jeu, ...
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Lun, 1=Mar, ..., 3=Jeu, ...

    console.log(
      `Date du jour: ${todayFormatted}, JS dayOfWeek: ${dayOfWeek}, index dans schedule_data: ${dayIndex}`
    );

    // Solution temporaire avec des données simulées
    const employeesToday = [
      { name: "Stacy Menendez", department: "Caisses" },
      { name: "Quentin Tarantino", department: "Caisses" },
      { name: "Zinédine Zidane", department: "Informatique" },
      { name: "Pierre Martin", department: "Boutique" },
      { name: "Chris Moss", department: "Boutique" },
    ];

    console.log(
      `Solution temporaire : retour de ${employeesToday.length} employés travaillant aujourd'hui`
    );

    res.json({
      success: true,
      data: employeesToday,
      metadata: {
        today: todayFormatted,
        day_index: dayIndex,
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des employés",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/employees/hours-today
 * @desc    Obtenir les horaires des employés aujourd'hui
 * @access  Admin only
 */
router.get("/employees/hours-today", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les horaires des employés aujourd'hui");
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Récupérer la date d'aujourd'hui et l'indice du jour de la semaine
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // Solution temporaire avec des données simulées
    const [departments] = await connectDB.execute(
      "SELECT name FROM departments LIMIT 3"
    );
    const departmentNames = departments.map((d) => d.name);

    // Créer une liste statique d'employés avec leurs horaires aujourd'hui
    const employeeHoursToday = [
      {
        name: "Stacy Menendez",
        department: departmentNames[0] || "Caisses",
        start_time: "09:00",
        end_time: "17:00",
        hours: "8.0",
      },
      {
        name: "Quentin Tarantino",
        department: departmentNames[0] || "Caisses",
        start_time: "08:00",
        end_time: "16:00",
        hours: "8.0",
      },
      {
        name: "Zinédine Zidane",
        department: departmentNames[1] || "Informatique",
        start_time: "10:00",
        end_time: "18:00",
        hours: "8.0",
      },
      {
        name: "Pierre Martin",
        department: departmentNames[2] || "Boutique",
        start_time: "09:00",
        end_time: "13:00",
        hours: "4.0",
      },
      {
        name: "Chris Moss",
        department: departmentNames[2] || "Boutique",
        start_time: "14:00",
        end_time: "20:00",
        hours: "6.0",
      },
    ];

    console.log(
      `Solution temporaire : retour de ${employeeHoursToday.length} employés avec leurs horaires aujourd'hui`
    );

    res.json({
      success: true,
      data: employeeHoursToday,
      metadata: {
        today: todayFormatted,
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires des employés:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des horaires des employés",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chatbot/hours/positive
 * @desc    Obtenir la liste des employés avec un solde d'heures positif
 * @access  Admin only
 */
router.get("/hours/positive", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les soldes d'heures positifs");
    const connectDB = require("../config/db");
    const userId = req.user.id;

    // Solution temporaire avec des données simulées
    const [departments] = await connectDB.execute(
      "SELECT name FROM departments LIMIT 3"
    );
    const departmentNames = departments.map((d) => d.name);

    // Créer une liste statique d'employés avec solde positif
    const positiveBalances = [
      {
        name: "Stacy Menendez",
        department: departmentNames[0] || "Caisses",
        balance: "2.00",
      },
      {
        name: "Quentin Tarantino",
        department: departmentNames[0] || "Caisses",
        balance: "5.30",
      },
      {
        name: "Zinédine Zidane",
        department: departmentNames[1] || "Informatique",
        balance: "1.25",
      },
      {
        name: "Chris Moss",
        department: departmentNames[2] || "Boutique",
        balance: "3.75",
      },
    ];

    console.log(
      `Solution temporaire : retour de ${positiveBalances.length} employés avec solde positif`
    );

    res.json({
      success: true,
      data: positiveBalances,
      metadata: {
        info: "Solution temporaire : ceci est une liste fixe pour le développement",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des soldes d'heures positifs:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des soldes d'heures positifs",
      error: error.message,
    });
  }
});

module.exports = router;
