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
    id: "conges_prochain",
    keywords: ["prochain congé", "congés à venir", "prochaines vacances"],
    handler: async (userId) => {
      const employeeId = await getEmployeeId(userId);
      if (!employeeId) {
        return { text: "Aucun compte employé trouvé pour cet utilisateur." };
      }

      const [rows] = await connectDB.execute(
        `SELECT start_date FROM vacation_requests 
                 WHERE employee_id = ? 
                 AND status = 'approved' 
                 AND start_date >= CURDATE() 
                 ORDER BY start_date ASC 
                 LIMIT 1`,
        [employeeId]
      );

      if (rows.length === 0) {
        return { text: "Aucun congé n'est prévu prochainement." };
      }

      return {
        text: `Votre prochain congé commence le ${rows[0].start_date}.`,
      };
    },
  },
  {
    id: "solde_heures_negatif",
    keywords: [
      "solde d'heures négatif",
      "heures négatives",
      "déficit d'heures",
    ],
    handler: async (userId) => {
      const employeeId = await getEmployeeId(userId);
      if (!employeeId) {
        return { text: "Aucun compte employé trouvé pour cet utilisateur." };
      }

      const [rows] = await connectDB.execute(
        `SELECT balance FROM work_hours 
                 WHERE employee_id = ? 
                 AND balance < 0`,
        [employeeId]
      );

      if (rows.length === 0) {
        return { text: "Aucun employé n'a un solde d'heures négatif." };
      }

      return {
        text: `Votre solde d'heures est négatif de ${rows[0].balance} heures.`,
      };
    },
  },
];

// Fonction pour trouver une règle correspondant au message de l'utilisateur
async function findMatchingRule(message, userId) {
  const lowerMessage = message.toLowerCase().trim();
  for (const rule of chatbotRules) {
    if (rule.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return await rule.handler(userId);
    }
  }
  return {
    text: "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?",
  };
}

module.exports = { findMatchingRule };
