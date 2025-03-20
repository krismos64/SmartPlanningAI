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
    const userRole = req.user.role;

    console.log("User ID reçu dans le chatbot :", userId);
    console.log("Rôle de l'utilisateur :", userRole);

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

    // Vérifier d'abord si c'est une requête pour des données personnalisées
    if (isPersonalDataQuery(message)) {
      console.log("Requête pour données personnalisées détectée");
      // Traiter comme une requête de données personnalisées
      const personalDataResult = await handlePersonalDataQuery(
        message,
        userId,
        userRole
      );
      return res.json(personalDataResult);
    }

    // Si ce n'est pas une requête de données personnalisées, traiter avec le système de règles standard
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
 * Détermine si une question concerne des données personnalisées
 * @param {string} message - Message de l'utilisateur
 * @returns {boolean} - True si c'est une requête pour des données personnalisées
 */
function isPersonalDataQuery(message) {
  const personalDataKeywords = [
    "qui ne travaille pas",
    "qui travaille",
    "absences",
    "congés",
    "horaires",
    "employés aujourd'hui",
    "solde d'heures",
    "planning",
    "prochaines personnes",
    "heures positif",
    "heures négatif",
  ];

  const normalizedMessage = message.toLowerCase().trim();
  return personalDataKeywords.some((keyword) =>
    normalizedMessage.includes(keyword)
  );
}

/**
 * Traite une requête pour des données personnalisées
 * @param {string} message - Message de l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {Object} - Résultat de la requête
 */
async function handlePersonalDataQuery(message, userId, userRole) {
  const normalizedMessage = message.toLowerCase().trim();
  const connectDB = require("../config/db");

  // Mapping des requêtes aux actions
  const queryActionMap = [
    {
      keywords: ["qui ne travaille pas"],
      action: "get_absences_today",
      adminOnly: true,
    },
    {
      keywords: ["qui travaille aujourd'hui"],
      action: "get_working_today",
      adminOnly: true,
    },
    {
      keywords: ["horaires des employés"],
      action: "get_employee_hours_today",
      adminOnly: true,
    },
    {
      keywords: ["prochaines personnes en congés"],
      action: "get_upcoming_vacations",
      adminOnly: true,
    },
    {
      keywords: ["solde d'heures positif"],
      action: "get_positive_hours",
      adminOnly: true,
    },
    {
      keywords: ["solde d'heures négatif"],
      action: "get_negative_hours",
      adminOnly: true,
    },
    {
      keywords: ["plannings à faire", "manque-t-il des plannings"],
      action: "get_missing_schedules",
      adminOnly: true,
    },

    // Questions personnelles (pour tous les utilisateurs)
    {
      keywords: ["mes congés", "mon solde"],
      action: "get_my_vacation_balance",
      adminOnly: false,
    },
    {
      keywords: ["mes horaires", "mon planning"],
      action: "get_my_schedule",
      adminOnly: false,
    },
  ];

  // Trouver l'action correspondante
  const matchedQuery = queryActionMap.find((query) =>
    query.keywords.some((keyword) => normalizedMessage.includes(keyword))
  );

  if (!matchedQuery) {
    return {
      success: true,
      intent: "UNKNOWN_PERSONAL_QUERY",
      message:
        "Je ne comprends pas votre question sur les données personnalisées. Pourriez-vous reformuler ?",
    };
  }

  // Vérifier les permissions
  if (matchedQuery.adminOnly && userRole !== "admin") {
    return {
      success: true,
      intent: "PERMISSION_DENIED",
      message:
        "Vous n'avez pas les permissions nécessaires pour accéder à ces données. Seuls les administrateurs peuvent consulter ces informations.",
    };
  }

  // Si c'est une requête personnelle (non-admin)
  if (!matchedQuery.adminOnly) {
    // Récupérer l'ID de l'employé associé à cet utilisateur
    const [employee] = await connectDB.execute(
      "SELECT id FROM employees WHERE user_id = ?",
      [userId]
    );

    if (employee.length === 0) {
      return {
        success: true,
        intent: "NO_EMPLOYEE_RECORD",
        message:
          "Votre compte utilisateur n'est pas associé à un employé dans le système.",
      };
    }

    const employeeId = employee[0].id;

    // Traiter la requête personnelle
    switch (matchedQuery.action) {
      case "get_my_vacation_balance":
        const [vacationData] = await connectDB.execute(
          "SELECT vacation_balance FROM employees WHERE id = ?",
          [employeeId]
        );

        if (vacationData.length > 0) {
          return {
            success: true,
            intent: "MY_VACATION_BALANCE",
            message: `Votre solde de congés actuel est de ${
              vacationData[0].vacation_balance || 0
            } jours.`,
          };
        }
        break;

      case "get_my_schedule":
        const today = new Date().toISOString().split("T")[0];
        const [scheduleData] = await connectDB.execute(
          `SELECT ws.*, JSON_EXTRACT(schedule_data, '$.monday') as monday,
          JSON_EXTRACT(schedule_data, '$.tuesday') as tuesday,
          JSON_EXTRACT(schedule_data, '$.wednesday') as wednesday,
          JSON_EXTRACT(schedule_data, '$.thursday') as thursday,
          JSON_EXTRACT(schedule_data, '$.friday') as friday,
          JSON_EXTRACT(schedule_data, '$.saturday') as saturday,
          JSON_EXTRACT(schedule_data, '$.sunday') as sunday
          FROM weekly_schedules ws 
          WHERE employee_id = ? AND week_start <= ? AND week_end >= ?
          ORDER BY week_start DESC LIMIT 1`,
          [employeeId, today, today]
        );

        if (scheduleData.length > 0) {
          return {
            success: true,
            intent: "MY_SCHEDULE",
            message: `Votre planning pour cette semaine a été trouvé. Votre temps de travail total prévu est de ${scheduleData[0].total_hours} heures.`,
          };
        } else {
          return {
            success: true,
            intent: "MY_SCHEDULE",
            message: "Aucun planning n'a été trouvé pour vous cette semaine.",
          };
        }
    }
  }

  // Définir l'action à utiliser pour les requêtes admin
  return {
    success: true,
    intent: matchedQuery.action,
    score: 1.0,
    message: "",
    actions: [matchedQuery.action],
  };
}

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
    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayName = dayNames[dayIndex];

    console.log(
      `Date du jour: ${todayFormatted}, index: ${dayIndex}, nom: ${dayName}`
    );

    // Récupérer les employés qui sont en congés aujourd'hui
    const [vacationAbsences] = await connectDB.execute(
      `
      SELECT e.id, e.first_name, e.last_name, d.name as department, 'congé' as reason
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE vr.status = 'approved'
      AND ? BETWEEN vr.start_date AND vr.end_date
    `,
      [todayFormatted]
    );

    // Récupérer les employés qui n'ont pas de shift aujourd'hui
    const [noShiftAbsences] = await connectDB.execute(
      `
      SELECT e.id, e.first_name, e.last_name, d.name as department, 'non programmé' as reason
      FROM employees e
      LEFT JOIN departments d ON e.department = d.id
      LEFT JOIN shifts s ON e.id = s.employee_id 
        AND DATE(s.start_time) = ?
      WHERE s.id IS NULL AND e.status = 'active'
    `,
      [todayFormatted]
    );

    // Récupérer les employés qui ont 0 heures dans leur planning hebdomadaire pour aujourd'hui
    const [zeroHoursAbsences] = await connectDB.execute(
      `
      SELECT e.id, e.first_name, e.last_name, d.name as department, 'repos' as reason
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE ws.week_start <= ? AND ws.week_end >= ?
      AND (
        JSON_EXTRACT(ws.schedule_data, '$."${dayName}".hours') = 0
        OR JSON_EXTRACT(ws.schedule_data, '$."${dayName}".absent') = true
      )
    `,
      [todayFormatted, todayFormatted]
    );

    // Combiner les résultats
    let absencesToday = [
      ...vacationAbsences,
      ...noShiftAbsences,
      ...zeroHoursAbsences,
    ];

    // Dédupliquer les employés (un employé pourrait apparaître dans plusieurs requêtes)
    const employeeIds = new Set();
    absencesToday = absencesToday.filter((emp) => {
      if (employeeIds.has(emp.id)) return false;
      employeeIds.add(emp.id);
      return true;
    });

    // Formater les données pour la réponse
    const formattedAbsences = absencesToday.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "Non affecté",
      reason: emp.reason,
    }));

    console.log(
      `Récupération de ${formattedAbsences.length} employés absents aujourd'hui`
    );

    res.json({
      success: true,
      data: formattedAbsences,
      metadata: {
        today: todayFormatted,
        day_index: dayIndex,
        day_name: dayName,
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

    // Récupérer les congés approuvés à venir, commençant dans les 30 prochains jours
    const [upcomingVacations] = await connectDB.execute(`
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department,
        vr.start_date,
        vr.end_date
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE vr.status = 'approved'
      AND vr.start_date >= CURDATE()
      AND vr.start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY vr.start_date ASC
    `);

    // Formater les dates
    const formattedVacations = upcomingVacations.map((vacation) => {
      const startDate = new Date(vacation.start_date);
      const endDate = new Date(vacation.end_date);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };

      return {
        name: `${vacation.first_name} ${vacation.last_name}`,
        department: vacation.department || "Non affecté",
        start_date: startDate.toLocaleDateString("fr-FR", options),
        end_date: endDate.toLocaleDateString("fr-FR", options),
      };
    });

    console.log(
      `Récupération de ${formattedVacations.length} prochains congés`
    );

    res.json({
      success: true,
      data: formattedVacations,
      metadata: {
        period: "30 jours à venir",
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

    // Calculer la date de début de la semaine prochaine (lundi)
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((7 - today.getDay() + 1) % 7) || 7);
    nextMonday.setHours(0, 0, 0, 0);
    const nextMondayFormatted = nextMonday.toISOString().split("T")[0];

    // Récupérer tous les départements
    const [allDepartments] = await connectDB.execute(`
      SELECT id, name FROM departments WHERE active = 1
    `);

    // Récupérer les départements qui ont déjà un planning pour la semaine prochaine
    const [scheduledDepartments] = await connectDB.execute(
      `
      SELECT DISTINCT d.id
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      JOIN departments d ON e.department = d.id
      WHERE ws.week_start = ?
    `,
      [nextMondayFormatted]
    );

    // Créer un set des IDs des départements avec planning
    const scheduledDeptIds = new Set(
      scheduledDepartments.map((dept) => dept.id)
    );

    // Filtrer les départements sans planning
    const missingSchedules = allDepartments.filter(
      (dept) => !scheduledDeptIds.has(dept.id)
    );

    console.log(
      `Récupération de ${missingSchedules.length} départements sans planning pour la semaine prochaine`
    );

    res.json({
      success: true,
      data: missingSchedules,
      metadata: {
        nextMonday: nextMondayFormatted,
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
 * @route   GET /api/chatbot/hours/positive
 * @desc    Obtenir la liste des employés avec un solde d'heures positif
 * @access  Admin only
 */
router.get("/hours/positive", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les soldes d'heures positifs");
    const connectDB = require("../config/db");

    // Récupérer les employés avec un solde d'heures positif
    const [positiveBalances] = await connectDB.execute(`
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department,
        e.hour_balance as balance
      FROM employees e
      LEFT JOIN departments d ON e.department = d.id
      WHERE e.hour_balance > 0
      ORDER BY e.hour_balance DESC
    `);

    // Formater les données pour la réponse
    const formattedBalances = positiveBalances.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "Non affecté",
      balance: parseFloat(emp.balance).toFixed(2),
    }));

    console.log(
      `Récupération de ${formattedBalances.length} employés avec solde positif`
    );

    res.json({
      success: true,
      data: formattedBalances,
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

/**
 * @route   GET /api/chatbot/hours/negative
 * @desc    Obtenir la liste des employés avec un solde d'heures négatif
 * @access  Admin only
 */
router.get("/hours/negative", adminOnly, async (req, res) => {
  try {
    console.log("Requête pour les soldes d'heures négatifs");
    const connectDB = require("../config/db");

    // Récupérer les employés avec un solde d'heures négatif
    const [negativeBalances] = await connectDB.execute(`
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department,
        e.hour_balance as balance
      FROM employees e
      LEFT JOIN departments d ON e.department = d.id
      WHERE e.hour_balance < 0
      ORDER BY e.hour_balance ASC
    `);

    // Formater les données pour la réponse
    const formattedBalances = negativeBalances.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "Non affecté",
      balance: parseFloat(emp.balance).toFixed(2),
    }));

    console.log(
      `Récupération de ${formattedBalances.length} employés avec solde négatif`
    );

    res.json({
      success: true,
      data: formattedBalances,
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

    // Date du jour formatée pour SQL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // Déterminer l'index du jour pour l'accès aux données JSON
    const dayOfWeek = today.getDay(); // JS: 0=Dim, 1=Lun, ..., 4=Jeu, ...
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Lun, 1=Mar, ..., 3=Jeu, ...
    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayName = dayNames[dayIndex];

    console.log(
      `Date du jour: ${todayFormatted}, JS dayOfWeek: ${dayOfWeek}, index: ${dayIndex}, nom: ${dayName}`
    );

    // Récupérer les employés qui ont des shifts aujourd'hui
    const [shiftsToday] = await connectDB.execute(
      `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department
      FROM shifts s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE DATE(s.start_time) = ?
      AND s.status = 'approved'
    `,
      [todayFormatted]
    );

    // Récupérer les employés qui ont des heures dans leur planning hebdomadaire pour aujourd'hui
    const [scheduledToday] = await connectDB.execute(
      `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE ws.week_start <= ? AND ws.week_end >= ?
      AND (
        JSON_EXTRACT(ws.schedule_data, '$."${dayName}".hours') > 0
        AND JSON_EXTRACT(ws.schedule_data, '$."${dayName}".absent') IS NULL
      )
    `,
      [todayFormatted, todayFormatted]
    );

    // Combiner les résultats
    let employeesToday = [...shiftsToday, ...scheduledToday];

    // Dédupliquer les employés
    const employeeIds = new Set();
    employeesToday = employeesToday.filter((emp) => {
      if (employeeIds.has(emp.id)) return false;
      employeeIds.add(emp.id);
      return true;
    });

    // Formater les données pour la réponse
    const formattedEmployees = employeesToday.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "Non affecté",
    }));

    console.log(
      `Récupération de ${formattedEmployees.length} employés travaillant aujourd'hui`
    );

    res.json({
      success: true,
      data: formattedEmployees,
      metadata: {
        today: todayFormatted,
        day_index: dayIndex,
        day_name: dayName,
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

    // Récupérer la date d'aujourd'hui et l'indice du jour de la semaine
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];
    const dayOfWeek = today.getDay(); // JS: 0=Dim, 1=Lun, ..., 4=Jeu, ...
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Lun, 1=Mar, ..., 3=Jeu, ...
    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayName = dayNames[dayIndex];

    // Récupérer les horaires des employés dans les shifts
    const [shiftsHours] = await connectDB.execute(
      `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department,
        TIME_FORMAT(s.start_time, '%H:%i') as start_time,
        TIME_FORMAT(s.end_time, '%H:%i') as end_time,
        TIMESTAMPDIFF(HOUR, s.start_time, s.end_time) as hours
      FROM shifts s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE DATE(s.start_time) = ?
      AND s.status = 'approved'
    `,
      [todayFormatted]
    );

    // Récupérer les horaires des employés dans les plannings hebdomadaires
    const [schedulesHours] = await connectDB.execute(
      `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        d.name as department,
        JSON_EXTRACT(ws.schedule_data, '$."${dayName}".start_time') as start_time,
        JSON_EXTRACT(ws.schedule_data, '$."${dayName}".end_time') as end_time,
        JSON_EXTRACT(ws.schedule_data, '$."${dayName}".hours') as hours
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN departments d ON e.department = d.id
      WHERE ws.week_start <= ? AND ws.week_end >= ?
      AND JSON_EXTRACT(ws.schedule_data, '$."${dayName}".hours') > 0
    `,
      [todayFormatted, todayFormatted]
    );

    // Combiner les résultats
    let employeeHoursToday = [...shiftsHours];

    // Ajouter les employés des plannings si pas déjà inclus dans les shifts
    const employeeIds = new Set(shiftsHours.map((emp) => emp.id));
    schedulesHours.forEach((emp) => {
      if (!employeeIds.has(emp.id)) {
        employeeHoursToday.push({
          ...emp,
          // Nettoyer les valeurs JSON (enlever les guillemets)
          start_time: emp.start_time ? emp.start_time.replace(/"/g, "") : null,
          end_time: emp.end_time ? emp.end_time.replace(/"/g, "") : null,
          hours: emp.hours,
        });
      }
    });

    // Formater les données pour la réponse
    const formattedHours = employeeHoursToday.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "Non affecté",
      start_time: emp.start_time || "00:00",
      end_time: emp.end_time || "00:00",
      hours: parseFloat(emp.hours || 0).toFixed(1),
    }));

    console.log(
      `Récupération de ${formattedHours.length} employés avec leurs horaires aujourd'hui`
    );

    res.json({
      success: true,
      data: formattedHours,
      metadata: {
        today: todayFormatted,
        day_name: dayName,
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

module.exports = router;
