/**
 * Routes pour le chatbot basé sur des règles
 * Gère les requêtes liées au traitement des messages et aux réponses préconfigurées
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { findMatchingRule } = require("../services/chatbotRules");
const scheduleOptimizer = require("../services/scheduleOptimizer");

// Supprimer l'authentification globale
// router.use(auth);

// Route de test non authentifiée pour vérifier que le router fonctionne
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Le router chatbot est correctement configuré!",
  });
});

// Route de ping sans authentification pour tester la connectivité
router.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "Chatbot API is responding!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   POST /api/chatbot/process
 * @desc    Traiter un message utilisateur avec le système de règles
 * @access  Private
 */
router.post("/process", auth, async (req, res) => {
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
    "solde d'heures positif",
    "solde d'heures négatif",
    "solde positif",
    "solde négatif",
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
        break;

      default:
        return {
          success: false,
          intent: "UNKNOWN_PERSONAL_ACTION",
          message: "Cette action personnelle n'est pas reconnue.",
        };
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
router.post("/generate-schedule", auth, async (req, res) => {
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
router.get("/user-stats", auth, async (req, res) => {
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
      LEFT JOIN departments d ON e.department_id = d.id
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
      LEFT JOIN departments d ON e.department_id = d.id
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
      LEFT JOIN departments d ON e.department_id = d.id
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
      department: emp.department || "      ",
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
      LEFT JOIN departments d ON e.department_id = d.id
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
        department: vacation.department || "",
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
      JOIN departments d ON e.department_id = d.id
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
        e.department,
        e.hour_balance as balance
      FROM employees e
      WHERE e.hour_balance > 0
      ORDER BY e.hour_balance DESC
    `);

    // Formater les données pour la réponse
    const formattedBalances = positiveBalances.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "",
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
        e.department,
        e.hour_balance as balance
      FROM employees e
      WHERE e.hour_balance < 0
      ORDER BY e.hour_balance ASC
    `);

    // Formater les données pour la réponse
    const formattedBalances = negativeBalances.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "",
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
// Cette route est commentée car elle est remplacée par l'action "get_working_today" dans la route POST /api/chatbot/query
/*
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
        e.department,
        TIME_FORMAT(s.start_time, '%H:%i') as start_time,
        TIME_FORMAT(s.end_time, '%H:%i') as end_time,
        TIMESTAMPDIFF(HOUR, s.start_time, s.end_time) as hours
      FROM shifts s
      JOIN employees e ON s.employee_id = e.id
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
        d.name as department,
        ws.schedule_data->>CONCAT('$."', ?, '".start_time') as start_time,
        ws.schedule_data->>CONCAT('$."', ?, '".end_time') as end_time,
        ws.schedule_data->>CONCAT('$."', ?, '".hours') as hours
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ws.week_start <= ? AND ws.week_end >= ?
      AND CAST(ws.schedule_data->>CONCAT('$."', ?, '".hours') AS DECIMAL(5,2)) > 0
      AND (ws.schedule_data->>CONCAT('$."', ?, '".absent') IS NULL OR ws.schedule_data->>CONCAT('$."', ?, '".absent') = 'false')
      `,
      [
        dayName,
        dayName,
        dayName,
        todayFormatted,
        todayFormatted,
        dayName,
        dayName,
        dayName,
      ]
    );

    // Combiner les résultats
    let employeesToday = [...shiftsToday];

    // Ajouter les employés des plannings si pas déjà inclus dans les shifts
    const employeeIds = new Set(shiftsToday.map((emp) => emp.id));
    scheduledToday.forEach((emp) => {
      if (!employeeIds.has(emp.id)) {
        employeesToday.push({
          ...emp,
          department: emp.department, // Utiliser le département de l'employé récupéré
        });
      }
    });

    const formattedMessage =
      employeesToday.length > 0
        ? employeesToday
            .map(
              (e) =>
                `- ${e.first_name} ${e.last_name} (${
                  e.department ? e.department : "Non assigné"
                }) : ${e.start_time || "09:00"} - ${
                  e.end_time || "17:00"
                } (${parseFloat(e.hours || 8).toFixed(1)}h)`
            )
            .join("\n")
        : "Aucun employé ne travaille aujourd'hui selon les plannings et shifts enregistrés.";

    console.log(
      `Réponse finale: ${employeesToday.length} employés travaillent aujourd'hui`
    );

    return res.json({
      success: true,
      response: `${employeesToday.length} personnes travaillent aujourd'hui.`,
      data: employeesToday.map((e) => ({
        name: `${e.first_name} ${e.last_name}`,
        department: e.department || "Non assigné",
        horaires: `${e.start_time || "09:00"} - ${e.end_time || "17:00"}`,
        heures: parseFloat(e.hours || 8).toFixed(1),
      })),
      message: formattedMessage,
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
*/

/**
 * @route   GET /api/chatbot/employees/hours-today
 * @desc    Obtenir les horaires des employés aujourd'hui
 * @access  Admin only
 */
// Cette route est commentée car elle est remplacée par l'action "get_working_today" dans la route POST /api/chatbot/query
/*
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
      LEFT JOIN departments d ON e.department_id = d.id
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
        ws.schedule_data->>CONCAT('$."', ?, '".start_time') as start_time,
        ws.schedule_data->>CONCAT('$."', ?, '".end_time') as end_time,
        ws.schedule_data->>CONCAT('$."', ?, '".hours') as hours
      FROM weekly_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ws.week_start <= ? AND ws.week_end >= ?
      AND CAST(ws.schedule_data->>CONCAT('$."', ?, '".hours') AS DECIMAL(5,2)) > 0
    `,
      [todayFormatted, todayFormatted, dayName, dayName]
    );

    // Combiner les résultats
    let employeeHoursToday = [...shiftsHours];

    // Ajouter les employés des plannings si pas déjà inclus dans les shifts
    const employeeIds = new Set(shiftsHours.map((emp) => emp.id));
    schedulesHours.forEach((emp) => {
      if (!employeeIds.has(emp.id)) {
        employeeHoursToday.push({
          ...emp,
          // Valeurs déjà propres grâce à l'opérateur ->> dans la requête
          start_time: emp.start_time || null,
          end_time: emp.end_time || null,
          hours: emp.hours || "0",
        });
      }
    });

    // Formater les données pour la réponse
    const formattedHours = employeeHoursToday.map((emp) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || "",
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
*/

/**
 * @route   POST /api/chatbot/query
 * @desc    Exécuter une action du chatbot qui requiert des données réelles de la base de données
 * @access  Private - mais permet certaines actions sans authentification pour diagnostic
 */
router.post("/query", async (req, res) => {
  try {
    const { action } = req.body;

    // Liste des actions qui fonctionnent sans authentification pour le test/diagnostic
    const publicActions = [
      "check_data",
      "get_upcoming_vacations",
      "get_working_today",
      "get_absences_today",
      "get_positive_hours",
      "get_negative_hours",
    ];

    // Si c'est une action publique, on la traite sans authentification
    if (publicActions.includes(action)) {
      const connectDB = require("../config/db");

      // Action check_data : vérifier la connexion à la base de données
      if (action === "check_data") {
        try {
          // Récupérer des statistiques basiques de la base de données
          const [schedulesCount] = await connectDB.execute(
            "SELECT COUNT(*) as count FROM weekly_schedules"
          );
          const [employeesCount] = await connectDB.execute(
            "SELECT COUNT(*) as count FROM employees"
          );
          const [departmentsCount] = await connectDB.execute(
            "SELECT COUNT(*) as count FROM departments"
          );
          const [employeesData] = await connectDB.execute(
            "SELECT first_name, last_name, status, hour_balance FROM employees"
          );

          return res.json({
            success: true,
            response: "✅ Connecté à la base de données ✅",
            suggestions: [
              {
                text: "Qui travaille aujourd'hui?",
                action: "get_working_today",
              },
              {
                text: "Qui est absent aujourd'hui?",
                action: "get_absences_today",
              },
              { text: "Prochains congés", action: "get_upcoming_vacations" },
              {
                text: "Soldes d'heures positifs",
                action: "get_positive_hours",
              },
              {
                text: "Soldes d'heures négatifs",
                action: "get_negative_hours",
              },
            ],
            data: {
              tables: 10,
              employees: employeesCount[0].count,
              departments: departmentsCount[0].count,
              schedules: schedulesCount[0].count,
              employees_list: employeesData.map((e) => ({
                name: `${e.first_name} ${e.last_name}`,
                status: e.status,
                balance: parseFloat(e.hour_balance).toFixed(2),
              })),
            },
          });
        } catch (error) {
          console.error(
            "Erreur lors de la vérification de la connexion à la base de données:",
            error
          );
          return res.status(500).json({
            success: false,
            response:
              "Erreur lors de la vérification de la connexion à la base de données",
            error: error.message,
          });
        }
      }

      // Action get_working_today : obtenir employés qui travaillent aujourd'hui
      else if (action === "get_working_today") {
        // Date du jour formatée pour SQL
        const today = new Date();
        const todayFormatted = today.toISOString().split("T")[0];

        // Déterminer le jour de la semaine (0 = lundi, 1 = mardi, etc.)
        const jsDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
        const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // 0 = lundi, 1 = mardi, ..., 6 = dimanche

        console.log(
          `get_working_today : Jour JavaScript = ${jsDay}, Index = ${dayIndex}, Date SQL = ${todayFormatted}`
        );

        // Récupérer les employés qui ont des shifts aujourd'hui
        const [shiftsToday] = await connectDB.execute(
          `
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            TIME_FORMAT(s.start_time, '%H:%i') as start_time,
            TIME_FORMAT(s.end_time, '%H:%i') as end_time,
            TIMESTAMPDIFF(HOUR, s.start_time, s.end_time) as hours
          FROM shifts s
          JOIN employees e ON s.employee_id = e.id
          WHERE DATE(s.start_time) = ?
          AND s.status = 'approved'
          `,
          [todayFormatted]
        );

        console.log(`Employés avec shifts aujourd'hui: ${shiftsToday.length}`);

        // Récupérer d'abord le planning complet pour débugger
        const [allSchedules] = await connectDB.execute(
          `
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            ws.schedule_data
          FROM weekly_schedules ws
          JOIN employees e ON ws.employee_id = e.id
          WHERE ws.week_start <= ? AND ws.week_end >= ?
          `,
          [todayFormatted, todayFormatted]
        );

        console.log(`Plannings trouvés: ${allSchedules.length}`);
        allSchedules.forEach((schedule) => {
          try {
            const scheduleData = JSON.parse(schedule.schedule_data);
            const dayData = scheduleData[dayIndex];
            console.log(
              `Planning pour ${schedule.first_name}: jour ${dayIndex}:`,
              dayData
            );
          } catch (e) {
            console.error("Erreur parsing JSON:", e);
          }
        });

        // Récupérer les employés qui ont des heures dans leur planning hebdomadaire pour aujourd'hui
        const scheduledToday = [];

        // Analyser manuellement les plannings
        for (const schedule of allSchedules) {
          try {
            const scheduleData = JSON.parse(schedule.schedule_data);
            const dayData = scheduleData[dayIndex];

            if (
              dayData &&
              dayData.type === "work" &&
              parseFloat(dayData.hours) > 0
            ) {
              // Récupérer l'heure de début et de fin du premier créneau horaire
              let startTime = "09:00";
              let endTime = "17:00";

              if (dayData.timeSlots && dayData.timeSlots.length > 0) {
                startTime = dayData.timeSlots[0].start;
                endTime = dayData.timeSlots[0].end;
              }

              scheduledToday.push({
                id: schedule.id,
                first_name: schedule.first_name,
                last_name: schedule.last_name,
                department: schedule.department,
                start_time: startTime,
                end_time: endTime,
                hours: dayData.hours,
              });
            }
          } catch (e) {
            console.error("Erreur lors de l'analyse du planning:", e);
          }
        }

        console.log(
          `Employés avec planning aujourd'hui (après analyse manuelle): ${scheduledToday.length}`
        );

        // Combiner les résultats
        let employeesToday = [...shiftsToday];

        // Ajouter les employés des plannings si pas déjà inclus dans les shifts
        const employeeIds = new Set(shiftsToday.map((emp) => emp.id));
        scheduledToday.forEach((emp) => {
          if (!employeeIds.has(emp.id)) {
            employeesToday.push({
              ...emp,
              department: emp.department, // Utiliser le département de l'employé récupéré
            });
          }
        });

        const formattedMessage =
          employeesToday.length > 0
            ? employeesToday
                .map(
                  (e) =>
                    `- ${e.first_name} ${e.last_name} (${
                      e.department ? e.department : "Non assigné"
                    }) : ${e.start_time || "09:00"} - ${
                      e.end_time || "17:00"
                    } (${parseFloat(e.hours || 8).toFixed(1)}h)`
                )
                .join("\n")
            : "Aucun employé ne travaille aujourd'hui selon les plannings et shifts enregistrés.";

        console.log(
          `Réponse finale: ${employeesToday.length} employés travaillent aujourd'hui`
        );

        return res.json({
          success: true,
          response: `${employeesToday.length} personnes travaillent aujourd'hui.`,
          data: employeesToday.map((e) => ({
            name: `${e.first_name} ${e.last_name}`,
            department: e.department || "Non assigné",
            horaires: `${e.start_time || "09:00"} - ${e.end_time || "17:00"}`,
            heures: parseFloat(e.hours || 8).toFixed(1),
          })),
          message: formattedMessage,
        });
      }

      // Action get_upcoming_vacations : obtenir prochains congés
      else if (action === "get_upcoming_vacations") {
        // Récupérer les congés à venir
        const [vacations] = await connectDB.execute(`
          SELECT e.first_name, e.last_name, e.department, vr.start_date, vr.end_date
          FROM vacation_requests vr
          JOIN employees e ON vr.employee_id = e.id
          WHERE vr.status = 'approved' AND vr.start_date >= CURDATE()
          ORDER BY vr.start_date ASC
          LIMIT 10
        `);

        return res.json({
          success: true,
          response: `${vacations.length} congés à venir dans les prochains jours.`,
          data: vacations.map((v) => {
            const startDate = new Date(v.start_date);
            const endDate = new Date(v.end_date);
            const options = { day: "2-digit", month: "2-digit" };
            const duration =
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            return {
              name: `${v.first_name} ${v.last_name}`,
              department: v.department || "",
              period: `${startDate.toLocaleDateString(
                "fr-FR",
                options
              )} - ${endDate.toLocaleDateString("fr-FR", options)}`,
              duree: `${duration} jour${duration > 1 ? "s" : ""}`,
            };
          }),
          message:
            vacations.length > 0
              ? "Prochains congés :\n" +
                vacations
                  .map((v) => {
                    const startDate = new Date(v.start_date);
                    const endDate = new Date(v.end_date);
                    const options = { day: "2-digit", month: "2-digit" };
                    const duration =
                      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) +
                      1;
                    return `- ${v.first_name} ${v.last_name} (${
                      v.department || "Sans département"
                    }) : du ${startDate.toLocaleDateString(
                      "fr-FR",
                      options
                    )} au ${endDate.toLocaleDateString(
                      "fr-FR",
                      options
                    )} (${duration} jour${duration > 1 ? "s" : ""})`;
                  })
                  .join("\n")
              : "Aucun congé à venir n'est enregistré dans le système.",
        });
      }

      // Action get_absences_today : obtenir employés absents aujourd'hui
      else if (action === "get_absences_today") {
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

        console.log(`Jour actuel: ${dayName}, index: ${dayIndex}`);

        // Récupérer les absences d'aujourd'hui (congés)
        const [vacationAbsences] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, 'congé' as reason
           FROM vacation_requests vr
           JOIN employees e ON vr.employee_id = e.id
           WHERE vr.status = 'approved' AND ? BETWEEN vr.start_date AND vr.end_date`,
          [todayFormatted]
        );

        // Récupérer les employés actifs qui n'ont pas de planning du tout pour cette semaine
        const [noPlanningAbsences] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, 'sans planning' as reason 
           FROM employees e 
           LEFT JOIN weekly_schedules ws ON e.id = ws.employee_id 
             AND ? BETWEEN ws.week_start AND ws.week_end 
           WHERE e.status = 'active' AND ws.id IS NULL`,
          [todayFormatted]
        );

        console.log(`Employés sans planning: ${noPlanningAbsences.length}`);

        // Récupérer tous les plannings qui couvrent la date d'aujourd'hui
        const [allSchedules] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, ws.schedule_data
           FROM weekly_schedules ws
           JOIN employees e ON ws.employee_id = e.id
           WHERE ws.week_start <= ? AND ws.week_end >= ?`,
          [todayFormatted, todayFormatted]
        );

        console.log(`Planifications trouvées: ${allSchedules.length}`);

        // Analyser manuellement les plannings pour trouver les employés en repos
        const reposAbsences = [];
        for (const schedule of allSchedules) {
          try {
            const scheduleData = JSON.parse(schedule.schedule_data);
            const dayData = scheduleData[dayIndex];

            if (
              dayData &&
              (dayData.type === "rest" ||
                dayData.type === "absence" ||
                (dayData.type === "work" && parseFloat(dayData.hours) === 0))
            ) {
              reposAbsences.push({
                id: schedule.id,
                first_name: schedule.first_name,
                last_name: schedule.last_name,
                department: schedule.department,
                reason: "repos",
              });
            }
          } catch (e) {
            console.error("Erreur parsing JSON:", e);
          }
        }

        console.log(`Employés en repos: ${reposAbsences.length}`);

        // Combiner les résultats
        let absencesToday = [
          ...vacationAbsences,
          ...noPlanningAbsences,
          ...reposAbsences,
        ];

        // Dédupliquer les employés (un employé pourrait apparaître dans plusieurs requêtes)
        const employeeIds = new Set();
        absencesToday = absencesToday.filter((emp) => {
          if (employeeIds.has(emp.id)) return false;
          employeeIds.add(emp.id);
          return true;
        });

        return res.json({
          success: true,
          response: `${absencesToday.length} personnes sont absentes aujourd'hui.`,
          data: absencesToday.map((a) => ({
            name: `${a.first_name} ${a.last_name}`,
            department: a.department || "Non assigné",
            reason: a.reason,
          })),
          message:
            absencesToday.length > 0
              ? absencesToday
                  .map(
                    (a) =>
                      `- ${a.first_name} ${a.last_name} (${
                        a.department || "Non assigné"
                      }) : ${a.reason}`
                  )
                  .join("\n")
              : "Aucune absence enregistrée pour aujourd'hui dans le système.",
        });
      }

      // Action get_positive_hours : obtenir employés avec un solde d'heures positif
      else if (action === "get_positive_hours") {
        // Récupérer les employés avec un solde d'heures positif
        const [positiveBalances] = await connectDB.execute(`
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            e.hour_balance as balance
          FROM employees e
          WHERE e.hour_balance > 0
          ORDER BY e.hour_balance DESC
        `);

        return res.json({
          success: true,
          response: `${positiveBalances.length} employés ont un solde d'heures positif.`,
          data: positiveBalances.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || "",
            balance: parseFloat(emp.balance).toFixed(2),
          })),
          message:
            positiveBalances.length > 0
              ? "Soldes d'heures positifs :\n" +
                positiveBalances
                  .map(
                    (emp) =>
                      `- ${emp.first_name} ${emp.last_name} (${
                        emp.department || "Sans département"
                      }) : +${parseFloat(emp.balance).toFixed(2)}h`
                  )
                  .join("\n")
              : "Aucun employé n'a de solde d'heures positif actuellement.",
        });
      }

      // Action get_negative_hours : obtenir employés avec un solde d'heures négatif
      else if (action === "get_negative_hours") {
        // Récupérer les employés avec un solde d'heures négatif
        const [negativeBalances] = await connectDB.execute(`
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            e.hour_balance as balance
          FROM employees e
          WHERE e.hour_balance < 0
          ORDER BY e.hour_balance ASC
        `);

        return res.json({
          success: true,
          response: `${negativeBalances.length} employés ont un solde d'heures négatif.`,
          data: negativeBalances.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || "",
            balance: parseFloat(emp.balance).toFixed(2),
          })),
          message:
            negativeBalances.length > 0
              ? "Soldes d'heures négatifs :\n" +
                negativeBalances
                  .map(
                    (emp) =>
                      `- ${emp.first_name} ${emp.last_name} (${
                        emp.department || "Sans département"
                      }) : ${parseFloat(emp.balance).toFixed(2)}h`
                  )
                  .join("\n")
              : "Aucun employé n'a de solde d'heures négatif actuellement.",
        });
      }
    }

    // Pour toutes les autres actions, l'authentification est requise
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED",
        response:
          "Veuillez vous connecter pour accéder à cette fonctionnalité.",
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`Exécution de l'action chatbot: ${action}`);

    if (!action) {
      return res.status(400).json({
        success: false,
        response: "Une action est requise",
      });
    }

    // Vérifier si c'est une action de vérification de données
    if (action === "check_data") {
      const connectDB = require("../config/db");

      // Récupérer des statistiques sur la base de données
      const [tablesCount] = await connectDB.execute(`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);

      const [employeesCount] = await connectDB.execute(`
        SELECT COUNT(*) as count FROM employees
      `);

      const [departmentsCount] = await connectDB.execute(`
        SELECT COUNT(*) as count FROM departments
      `);

      const [schedulesCount] = await connectDB.execute(`
        SELECT COUNT(*) as count FROM weekly_schedules
      `);

      // Récupérer des informations supplémentaires sur les employés
      const [employeesData] = await connectDB.execute(`
        SELECT e.first_name, e.last_name, e.hour_balance, e.status
        FROM employees e
        ORDER BY e.id
      `);

      // Récupérer des informations sur les congés
      const [vacationsCount] = await connectDB.execute(`
        SELECT COUNT(*) as count FROM vacation_requests
        WHERE status = 'approved' AND start_date >= CURDATE()
      `);

      // Construire un résumé des données disponibles
      return res.json({
        success: true,
        response: `✅ Connexion à la base de données réussie!\n\nVoici un résumé des données disponibles:\n- ${tablesCount[0].count} tables dans la base\n- ${employeesCount[0].count} employés enregistrés\n- ${departmentsCount[0].count} départements\n- ${schedulesCount[0].count} planifications hebdomadaires`,
        message:
          `✅ DONNÉES RÉELLES DE LA BASE DE DONNÉES ✅\n\n` +
          `📊 STATISTIQUES DE LA BASE DE DONNÉES:\n` +
          `- ${tablesCount[0].count} tables dans la base\n` +
          `- ${employeesCount[0].count} employés enregistrés\n` +
          `- ${departmentsCount[0].count} départements\n` +
          `- ${schedulesCount[0].count} planifications hebdomadaires\n` +
          `- ${vacationsCount[0].count} congés à venir\n\n` +
          `👥 LISTE DES EMPLOYÉS:\n` +
          employeesData
            .map(
              (e) =>
                `- ${e.first_name} ${e.last_name} (Statut: ${
                  e.status
                }, Solde d'heures: ${parseFloat(e.hour_balance).toFixed(2)}h)`
            )
            .join("\n"),
        suggestions: [
          { text: "Qui travaille aujourd'hui?", action: "get_working_today" },
          { text: "Qui est absent aujourd'hui?", action: "get_absences_today" },
          { text: "Prochains congés", action: "get_upcoming_vacations" },
          { text: "Soldes d'heures positifs", action: "get_positive_hours" },
          { text: "Soldes d'heures négatifs", action: "get_negative_hours" },
        ],
        data: {
          tables: tablesCount[0].count,
          employees: employeesCount[0].count,
          departments: departmentsCount[0].count,
          schedules: schedulesCount[0].count,
          employees_list: employeesData.map((e) => ({
            name: `${e.first_name} ${e.last_name}`,
            status: e.status,
            balance: parseFloat(e.hour_balance).toFixed(2),
          })),
        },
      });
    }

    // Actions personnelles de l'utilisateur
    if (action === "get_my_vacation_balance" || action === "get_my_schedule") {
      const connectDB = require("../config/db");

      // Récupérer l'ID de l'employé associé à cet utilisateur
      const [employee] = await connectDB.execute(
        "SELECT id FROM employees WHERE user_id = ?",
        [userId]
      );

      if (employee.length === 0) {
        return res.json({
          success: false,
          response:
            "Votre compte utilisateur n'est pas associé à un employé dans le système.",
        });
      }

      const employeeId = employee[0].id;

      if (action === "get_my_vacation_balance") {
        const [vacationData] = await connectDB.execute(
          "SELECT vacation_balance FROM employees WHERE id = ?",
          [employeeId]
        );

        if (vacationData.length > 0) {
          return res.json({
            success: true,
            response: `Votre solde de congés actuel est de ${
              vacationData[0].vacation_balance || 0
            } jours.`,
            data: { balance: vacationData[0].vacation_balance || 0 },
          });
        }
      } else if (action === "get_my_schedule") {
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
          return res.json({
            success: true,
            response: `Votre planning pour cette semaine a été trouvé. Votre temps de travail total prévu est de ${scheduleData[0].total_hours} heures.`,
            data: scheduleData[0],
          });
        } else {
          return res.json({
            success: true,
            response: "Aucun planning n'a été trouvé pour vous cette semaine.",
            data: null,
          });
        }
      }
    }

    // Routes administratives (nécessitent des permissions admin)
    if (
      userRole !== "admin" &&
      [
        "get_absences_today",
        "get_working_today",
        "get_employee_hours_today",
        "get_upcoming_vacations",
        "get_positive_hours",
        "get_negative_hours",
        "get_missing_schedules",
      ].includes(action)
    ) {
      return res.json({
        success: false,
        response:
          "Vous n'avez pas les permissions nécessaires pour cette action. Seuls les administrateurs peuvent consulter ces informations.",
      });
    }

    const connectDB = require("../config/db");

    // Traitement des actions admin
    switch (action) {
      case "get_absences_today": {
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

        console.log(`Jour actuel: ${dayName}, index: ${dayIndex}`);

        // Récupérer les absences d'aujourd'hui (congés)
        const [vacationAbsences] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, 'congé' as reason
           FROM vacation_requests vr
           JOIN employees e ON vr.employee_id = e.id
           WHERE vr.status = 'approved' AND ? BETWEEN vr.start_date AND vr.end_date`,
          [todayFormatted]
        );

        // Récupérer les employés actifs qui n'ont pas de planning du tout pour cette semaine
        const [noPlanningAbsences] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, 'sans planning' as reason 
           FROM employees e 
           LEFT JOIN weekly_schedules ws ON e.id = ws.employee_id 
             AND ? BETWEEN ws.week_start AND ws.week_end 
           WHERE e.status = 'active' AND ws.id IS NULL`,
          [todayFormatted]
        );

        console.log(`Employés sans planning: ${noPlanningAbsences.length}`);

        // Récupérer tous les plannings qui couvrent la date d'aujourd'hui
        const [allSchedules] = await connectDB.execute(
          `SELECT e.id, e.first_name, e.last_name, e.department, ws.schedule_data
           FROM weekly_schedules ws
           JOIN employees e ON ws.employee_id = e.id
           WHERE ws.week_start <= ? AND ws.week_end >= ?`,
          [todayFormatted, todayFormatted]
        );

        console.log(`Planifications trouvées: ${allSchedules.length}`);

        // Analyser manuellement les plannings pour trouver les employés en repos
        const reposAbsences = [];
        for (const schedule of allSchedules) {
          try {
            const scheduleData = JSON.parse(schedule.schedule_data);
            const dayData = scheduleData[dayIndex];

            if (
              dayData &&
              (dayData.type === "rest" ||
                dayData.type === "absence" ||
                (dayData.type === "work" && parseFloat(dayData.hours) === 0))
            ) {
              reposAbsences.push({
                id: schedule.id,
                first_name: schedule.first_name,
                last_name: schedule.last_name,
                department: schedule.department,
                reason: "repos",
              });
            }
          } catch (e) {
            console.error("Erreur parsing JSON:", e);
          }
        }

        console.log(`Employés en repos: ${reposAbsences.length}`);

        // Combiner les résultats
        let absencesToday = [
          ...vacationAbsences,
          ...noPlanningAbsences,
          ...reposAbsences,
        ];

        // Dédupliquer les employés (un employé pourrait apparaître dans plusieurs requêtes)
        const employeeIds = new Set();
        absencesToday = absencesToday.filter((emp) => {
          if (employeeIds.has(emp.id)) return false;
          employeeIds.add(emp.id);
          return true;
        });

        return res.json({
          success: true,
          response: `${absencesToday.length} personnes sont absentes aujourd'hui.`,
          data: absencesToday.map((a) => ({
            name: `${a.first_name} ${a.last_name}`,
            department: a.department || "Non assigné",
            reason: a.reason,
          })),
          message:
            absencesToday.length > 0
              ? absencesToday
                  .map(
                    (a) =>
                      `- ${a.first_name} ${a.last_name} (${
                        a.department || "Non assigné"
                      }) : ${a.reason}`
                  )
                  .join("\n")
              : "Aucune absence enregistrée pour aujourd'hui dans le système.",
        });
      }

      case "get_upcoming_vacations": {
        // Récupérer les congés à venir
        const [vacations] = await connectDB.execute(`
          SELECT e.first_name, e.last_name, e.department, vr.start_date, vr.end_date
          FROM vacation_requests vr
          JOIN employees e ON vr.employee_id = e.id
          WHERE vr.status = 'approved' AND vr.start_date >= CURDATE()
          ORDER BY vr.start_date ASC
          LIMIT 10
        `);

        return res.json({
          success: true,
          response: `${vacations.length} congés à venir dans les prochains jours.`,
          data: vacations.map((v) => {
            const startDate = new Date(v.start_date);
            const endDate = new Date(v.end_date);
            const options = { day: "2-digit", month: "2-digit" };
            const duration =
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            return {
              name: `${v.first_name} ${v.last_name}`,
              department: v.department || "",
              period: `${startDate.toLocaleDateString(
                "fr-FR",
                options
              )} - ${endDate.toLocaleDateString("fr-FR", options)}`,
              duree: `${duration} jour${duration > 1 ? "s" : ""}`,
            };
          }),
          message:
            vacations.length > 0
              ? "Prochains congés :\n" +
                vacations
                  .map((v) => {
                    const startDate = new Date(v.start_date);
                    const endDate = new Date(v.end_date);
                    const options = { day: "2-digit", month: "2-digit" };
                    const duration =
                      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) +
                      1;
                    return `- ${v.first_name} ${v.last_name} (${
                      v.department || "Sans département"
                    }) : du ${startDate.toLocaleDateString(
                      "fr-FR",
                      options
                    )} au ${endDate.toLocaleDateString(
                      "fr-FR",
                      options
                    )} (${duration} jour${duration > 1 ? "s" : ""})`;
                  })
                  .join("\n")
              : "Aucun congé à venir n'est enregistré dans le système.",
        });
      }

      case "get_positive_hours": {
        // Récupérer les employés avec un solde d'heures positif
        const [positiveBalances] = await connectDB.execute(`
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            e.hour_balance as balance
          FROM employees e
          WHERE e.hour_balance > 0
          ORDER BY e.hour_balance DESC
        `);

        return res.json({
          success: true,
          response: `${positiveBalances.length} employés ont un solde d'heures positif.`,
          data: positiveBalances.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || "",
            balance: parseFloat(emp.balance).toFixed(2),
          })),
          message:
            positiveBalances.length > 0
              ? "Soldes d'heures positifs :\n" +
                positiveBalances
                  .map(
                    (emp) =>
                      `- ${emp.first_name} ${emp.last_name} (${
                        emp.department || "Sans département"
                      }) : +${parseFloat(emp.balance).toFixed(2)}h`
                  )
                  .join("\n")
              : "Aucun employé n'a de solde d'heures positif actuellement.",
        });
      }

      case "get_negative_hours": {
        // Récupérer les employés avec un solde d'heures négatif
        const [negativeBalances] = await connectDB.execute(`
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            e.department,
            e.hour_balance as balance
          FROM employees e
          WHERE e.hour_balance < 0
          ORDER BY e.hour_balance ASC
        `);

        return res.json({
          success: true,
          response: `${negativeBalances.length} employés ont un solde d'heures négatif.`,
          data: negativeBalances.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || "",
            balance: parseFloat(emp.balance).toFixed(2),
          })),
          message:
            negativeBalances.length > 0
              ? "Soldes d'heures négatifs :\n" +
                negativeBalances
                  .map(
                    (emp) =>
                      `- ${emp.first_name} ${emp.last_name} (${
                        emp.department || "Sans département"
                      }) : ${parseFloat(emp.balance).toFixed(2)}h`
                  )
                  .join("\n")
              : "Aucun employé n'a de solde d'heures négatif actuellement.",
        });
      }

      default:
        return res.json({
          success: false,
          response: `Action '${action}' non reconnue ou non implémentée. Veuillez essayer une autre action.`,
        });
    }
  } catch (error) {
    console.error(
      `Erreur lors de l'exécution de l'action chatbot: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      response: `Une erreur s'est produite lors du traitement de votre demande: ${error.message}`,
    });
  }
});

module.exports = router;
