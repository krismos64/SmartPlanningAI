/**
 * Service de règles pour le chatbot
 * Définit les règles de correspondance et les réponses pour le chatbot
 */

const connectDB = require("../config/db");

// Règles du chatbot avec des mots-clés et des réponses
const chatbotRules = [
  {
    id: "conges_prochain",
    keywords: [
      "prochain congé",
      "congés à venir",
      "prochaines vacances",
      "quand est mon prochain congé",
    ],
    handler: async (userId) => {
      try {
        const [rows] = await connectDB.execute(
          `
          SELECT start_date FROM vacation_requests 
          WHERE employee_id = ? 
          AND status = 'approved' 
          AND start_date >= CURDATE() 
          ORDER BY start_date ASC 
          LIMIT 1
        `,
          [userId]
        );

        if (rows.length === 0) {
          return {
            text: "Vous n'avez pas de congés approuvés à venir.",
            actions: [
              { text: "Poser un congé", action: "create_vacation" },
              { text: "Voir tous mes congés", action: "list_vacations" },
            ],
          };
        }

        const date = new Date(rows[0].start_date);
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const dateFormatee = date.toLocaleDateString("fr-FR", options);

        return {
          text: `Votre prochain congé est prévu le ${dateFormatee}.`,
          actions: [{ text: "Voir tous mes congés", action: "list_vacations" }],
        };
      } catch (error) {
        console.error("Erreur lors de la recherche des congés:", error);
        return {
          text: "Désolé, je n'ai pas pu récupérer vos congés en raison d'une erreur technique.",
          error: true,
        };
      }
    },
  },

  {
    id: "conges_solde",
    keywords: [
      "solde de congés",
      "combien de congés",
      "jours de congés restants",
      "cp restants",
    ],
    handler: async (userId) => {
      try {
        const [rows] = await connectDB.execute(
          `
          SELECT vacation_balance FROM employees 
          WHERE id = ?
        `,
          [userId]
        );

        if (rows.length === 0) {
          return {
            text: "Je ne trouve pas votre solde de congés. Veuillez contacter les RH.",
            error: true,
          };
        }

        const solde = rows[0].vacation_balance;

        return {
          text: `Vous disposez actuellement de ${solde} jours de congés payés.`,
          actions: [
            { text: "Poser un congé", action: "create_vacation" },
            { text: "Voir mes congés", action: "list_vacations" },
          ],
        };
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du solde de congés:",
          error
        );
        return {
          text: "Désolé, je n'ai pas pu récupérer votre solde de congés en raison d'une erreur technique.",
          error: true,
        };
      }
    },
  },

  {
    id: "planning_semaine",
    keywords: [
      "mon planning",
      "horaires cette semaine",
      "mes horaires",
      "mon emploi du temps",
    ],
    handler: async (userId) => {
      try {
        // Obtenir la date de début de la semaine en cours
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de la semaine en cours

        const [rows] = await connectDB.execute(
          `
          SELECT ws.day_of_week, ws.start_time, ws.end_time
          FROM weekly_schedule_entries ws
          JOIN weekly_schedules s ON ws.schedule_id = s.id
          WHERE s.employee_id = ?
          AND s.start_date <= ?
          AND s.end_date >= ?
          ORDER BY ws.day_of_week
        `,
          [
            userId,
            startOfWeek.toISOString().split("T")[0],
            startOfWeek.toISOString().split("T")[0],
          ]
        );

        if (rows.length === 0) {
          return {
            text: "Je ne trouve pas votre planning pour cette semaine.",
            actions: [
              {
                text: "Voir le planning global",
                action: "view_global_schedule",
              },
            ],
          };
        }

        // Formater les horaires par jour
        const joursSemaine = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ];
        let message = "Voici votre planning pour cette semaine :\n\n";

        rows.forEach((shift) => {
          const jour = joursSemaine[shift.day_of_week - 1];
          const debut = shift.start_time.substring(0, 5);
          const fin = shift.end_time.substring(0, 5);
          message += `• ${jour}: ${debut} - ${fin}\n`;
        });

        return {
          text: message,
          actions: [{ text: "Modifier mon planning", action: "edit_schedule" }],
        };
      } catch (error) {
        console.error("Erreur lors de la récupération du planning:", error);
        return {
          text: "Désolé, je n'ai pas pu récupérer votre planning en raison d'une erreur technique.",
          error: true,
        };
      }
    },
  },

  {
    id: "absences_equipe",
    keywords: [
      "absences équipe",
      "qui est absent",
      "collègues absents",
      "congés équipe",
    ],
    handler: async (userId) => {
      try {
        // D'abord, on récupère le département de l'employé
        const [userDept] = await connectDB.execute(
          `
          SELECT department_id FROM employees WHERE id = ?
        `,
          [userId]
        );

        if (userDept.length === 0 || !userDept[0].department_id) {
          return {
            text: "Je ne peux pas déterminer votre équipe. Veuillez contacter les RH.",
            error: true,
          };
        }

        const departmentId = userDept[0].department_id;

        // Ensuite, on récupère les absences actuelles dans le département
        const [rows] = await connectDB.execute(
          `
          SELECT vr.start_date, vr.end_date, CONCAT(e.first_name, ' ', e.last_name) as employee_name
          FROM vacation_requests vr
          JOIN employees e ON vr.employee_id = e.id
          WHERE e.department_id = ?
          AND vr.status = 'approved'
          AND (
            (vr.start_date <= CURDATE() AND vr.end_date >= CURDATE()) OR
            (vr.start_date > CURDATE() AND vr.start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY))
          )
          ORDER BY vr.start_date
        `,
          [departmentId]
        );

        if (rows.length === 0) {
          return {
            text: "Aucun membre de votre équipe n'est absent aujourd'hui ni dans la semaine à venir.",
          };
        }

        let absentsAujourdhui = [];
        let absentsProchainement = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        rows.forEach((absence) => {
          const startDate = new Date(absence.start_date);
          const endDate = new Date(absence.end_date);

          if (startDate <= today && endDate >= today) {
            absentsAujourdhui.push(absence.employee_name);
          } else {
            const options = { weekday: "long", day: "numeric", month: "long" };
            const dateDebut = startDate.toLocaleDateString("fr-FR", options);
            const dateFin = endDate.toLocaleDateString("fr-FR", options);
            absentsProchainement.push(
              `${absence.employee_name} (du ${dateDebut} au ${dateFin})`
            );
          }
        });

        let message = "";

        if (absentsAujourdhui.length > 0) {
          message += `Absents aujourd'hui : ${absentsAujourdhui.join(
            ", "
          )}.\n\n`;
        }

        if (absentsProchainement.length > 0) {
          message += `Absences à venir :\n• ${absentsProchainement.join(
            "\n• "
          )}`;
        }

        return {
          text: message,
        };
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des absences de l'équipe:",
          error
        );
        return {
          text: "Désolé, je n'ai pas pu récupérer les absences de votre équipe en raison d'une erreur technique.",
          error: true,
        };
      }
    },
  },

  // Réponses statiques (sans requêtes SQL) pour les questions génériques
  {
    id: "aide_planning",
    keywords: [
      "comment modifier mon planning",
      "changer planning",
      "modifier horaires",
    ],
    response: {
      text: "Pour modifier votre planning, rendez-vous dans la section 'Planning' et suivez ces étapes:\n\n1. Cliquez sur la semaine concernée\n2. Sélectionnez le jour à modifier\n3. Cliquez sur 'Modifier cette journée'\n4. Ajustez vos horaires\n5. Enregistrez vos modifications\n\nAttention : les modifications doivent être validées par votre responsable.",
      actions: [{ text: "Aller au planning", action: "goto_planning" }],
    },
  },

  {
    id: "aide_conges",
    keywords: [
      "comment poser congé",
      "demander vacances",
      "créer demande congé",
      "poser rtt",
    ],
    response: {
      text: "Pour poser un congé, rendez-vous dans la section 'Congés' et suivez ces étapes:\n\n1. Cliquez sur 'Nouvelle demande'\n2. Sélectionnez le type de congé (CP, RTT, etc.)\n3. Choisissez les dates de début et de fin\n4. Ajoutez un commentaire si nécessaire\n5. Soumettez votre demande\n\nVotre demande sera ensuite examinée par votre responsable.",
      actions: [{ text: "Poser un congé", action: "create_vacation" }],
    },
  },

  {
    id: "aide_generale",
    keywords: [
      "aide",
      "help",
      "comment ça marche",
      "assistance",
      "besoin d'aide",
    ],
    response: {
      text: "Je suis l'assistant virtuel de SmartPlanning. Je peux vous aider avec :\n\n• Consultation de votre planning\n• Information sur vos congés\n• Détails sur votre équipe\n• Solde de congés\n• Absences dans votre équipe\n\nPosez simplement votre question en langage naturel.",
      actions: [
        { text: "Mon planning", action: "ask_planning" },
        { text: "Mes congés", action: "ask_vacations" },
        { text: "Mon équipe", action: "ask_team" },
      ],
    },
  },

  {
    id: "salutations",
    keywords: ["bonjour", "salut", "hello", "coucou", "bonsoir"],
    response: {
      text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      actions: [
        { text: "Mon planning", action: "ask_planning" },
        { text: "Mes congés", action: "ask_vacations" },
        { text: "Aide", action: "ask_help" },
      ],
    },
  },

  {
    id: "default",
    keywords: [],
    response: {
      text: "Désolé, je ne comprends pas votre demande. Pourriez-vous reformuler ou choisir l'une des options ci-dessous ?",
      actions: [
        { text: "Mon planning", action: "ask_planning" },
        { text: "Mes congés", action: "ask_vacations" },
        { text: "Aide", action: "ask_help" },
      ],
    },
  },
];

/**
 * Recherche la meilleure règle correspondant au message
 * @param {string} message - Message de l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Réponse formatée
 */
async function findMatchingRule(message, userId) {
  const messageLower = message.toLowerCase();

  // Recherche la règle avec le plus de correspondances de mots-clés
  let bestMatch = null;
  let bestScore = 0;

  for (const rule of chatbotRules) {
    // Si la règle n'a pas de mots-clés (règle par défaut), on la saute
    if (rule.keywords.length === 0) continue;

    // Calcul du score de correspondance
    let score = 0;
    for (const keyword of rule.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        // Plus le mot-clé est long, plus il est significatif
        score += keyword.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  // Si aucune correspondance trouvée, utiliser la règle par défaut
  if (!bestMatch || bestScore === 0) {
    bestMatch = chatbotRules.find((rule) => rule.id === "default");
  }

  // Si la règle a un handler (requête SQL), l'exécuter
  if (bestMatch.handler) {
    return await bestMatch.handler(userId);
  }

  // Sinon, retourner la réponse statique
  return bestMatch.response;
}

module.exports = {
  findMatchingRule,
};
