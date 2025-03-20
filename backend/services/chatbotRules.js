/**
 * Service de règles pour le chatbot
 * Définit les règles de correspondance et les réponses pour le chatbot
 */

const connectDB = require("../config/db");

// Fonction pour récupérer l'employee_id à partir du user_id
async function getEmployeeId(userId) {
  const [employee] = await connectDB.execute(
    "SELECT id FROM employees WHERE user_id = ?",
    [userId]
  );

  if (employee.length === 0) {
    return null;
  }
  return employee[0].id;
}

// Règles du chatbot avec des mots-clés et des réponses
const chatbotRules = [
  {
    id: "bienvenue",
    keywords: ["bonjour", "salut", "hello", "coucou", "hey"],
    handler: async (userId) => {
      return {
        text: "Bonjour ! Je suis l'assistant de SmartPlanning. Comment puis-je vous aider aujourd'hui ?",
      };
    },
  },
  {
    id: "aide",
    keywords: ["aide", "help", "assistance", "besoin d'aide", "comment faire"],
    handler: async (userId) => {
      return {
        text: "Je peux vous aider sur plusieurs sujets : plannings, congés, employés, statistiques, etc. Vous pouvez me poser une question directe ou consulter les sections d'aide disponibles.",
        actions: ["get_help"],
      };
    },
  },
  {
    id: "merci",
    keywords: ["merci", "thanks", "thank you", "thx"],
    handler: async (userId) => {
      return {
        text: "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.",
      };
    },
  },
  {
    id: "conges_prochain",
    keywords: [
      "prochain congé",
      "congés à venir",
      "prochaines vacances",
      "mes congés",
    ],
    handler: async (userId) => {
      const employeeId = await getEmployeeId(userId);
      if (!employeeId) {
        return { text: "Aucun compte employé trouvé pour cet utilisateur." };
      }

      const [rows] = await connectDB.execute(
        `SELECT start_date, end_date, type FROM vacation_requests 
                 WHERE employee_id = ? 
                 AND status = 'approved' 
                 AND start_date >= CURDATE() 
                 ORDER BY start_date ASC 
                 LIMIT 1`,
        [employeeId]
      );

      if (rows.length === 0) {
        return { text: "Aucun congé n'est prévu prochainement pour vous." };
      }

      // Formater les dates pour l'affichage
      const startDate = new Date(rows[0].start_date);
      const endDate = new Date(rows[0].end_date);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const formattedStart = startDate.toLocaleDateString("fr-FR", options);
      const formattedEnd = endDate.toLocaleDateString("fr-FR", options);
      const congeType = rows[0].type || "congé";

      return {
        text: `Votre prochain ${congeType} est prévu du ${formattedStart} au ${formattedEnd}.`,
      };
    },
  },
  {
    id: "planning_personnel",
    keywords: ["mon planning", "mon horaire", "mes heures"],
    handler: async (userId) => {
      const employeeId = await getEmployeeId(userId);
      if (!employeeId) {
        return { text: "Aucun compte employé trouvé pour cet utilisateur." };
      }

      const today = new Date().toISOString().split("T")[0];
      const [schedules] = await connectDB.execute(
        `SELECT * FROM weekly_schedules 
         WHERE employee_id = ? 
         AND week_start <= ? 
         AND week_end >= ?
         LIMIT 1`,
        [employeeId, today, today]
      );

      if (schedules.length === 0) {
        return {
          text: "Aucun planning n'est disponible pour vous cette semaine.",
        };
      }

      return {
        text: `Votre planning pour cette semaine est disponible. Vous avez un total de ${schedules[0].total_hours} heures prévues.`,
      };
    },
  },
  {
    id: "solde_heures",
    keywords: [
      "mon solde d'heures",
      "mes heures supplémentaires",
      "mon compteur d'heures",
    ],
    handler: async (userId) => {
      const employeeId = await getEmployeeId(userId);
      if (!employeeId) {
        return { text: "Aucun compte employé trouvé pour cet utilisateur." };
      }

      const [rows] = await connectDB.execute(
        `SELECT hour_balance FROM employees WHERE id = ?`,
        [employeeId]
      );

      if (rows.length === 0) {
        return { text: "Impossible de récupérer votre solde d'heures." };
      }

      const balance = parseFloat(rows[0].hour_balance || 0);
      let message = "";

      if (balance > 0) {
        message = `Votre solde d'heures est positif de ${balance.toFixed(
          2
        )} heures.`;
      } else if (balance < 0) {
        message = `Votre solde d'heures est négatif de ${Math.abs(
          balance
        ).toFixed(2)} heures.`;
      } else {
        message = "Votre solde d'heures est à zéro.";
      }

      return { text: message };
    },
  },
  {
    id: "au_revoir",
    keywords: ["au revoir", "bye", "à plus", "à bientôt", "ciao"],
    handler: async (userId) => {
      return {
        text: "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.",
      };
    },
  },
];

// Fonction pour trouver une règle correspondant au message de l'utilisateur
async function findMatchingRule(message, userId) {
  const lowerMessage = message.toLowerCase().trim();

  // Vérifier chaque règle pour une correspondance
  for (const rule of chatbotRules) {
    if (rule.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return await rule.handler(userId);
    }
  }

  // Aucune correspondance trouvée
  return {
    text: "Je n'ai pas compris votre demande. Pouvez-vous reformuler ou choisir parmi les options d'aide disponibles ?",
    actions: ["get_help"],
  };
}

module.exports = { findMatchingRule };
