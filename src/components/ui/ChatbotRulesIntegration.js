import { CHATBOT_TOPICS } from "../../config/chatbotTopics";

/**
 * Intégration du chatbot basée sur des règles prédéfinies
 */
class ChatbotRulesIntegration {
  constructor(callbacks) {
    this.topics = CHATBOT_TOPICS;
    this.onAddBotMessage = callbacks.onAddBotMessage;
    this.onSetIsTyping = callbacks.onSetIsTyping;
    this.onStartScheduleGeneration = callbacks.onStartScheduleGeneration;
    this.onHandleActionResult = callbacks.onHandleActionResult;
    this.currentTopic = null;
    console.log(
      "ChatbotRulesIntegration initialisé avec",
      this.topics.length,
      "sujets",
      this.topics.map((t) => t.id).join(", ")
    );
  }

  /**
   * Traite un message de l'utilisateur
   * @param {string} message - Message de l'utilisateur
   * @returns {Object} Résultat du traitement
   */
  async processMessage(message) {
    console.log("Traitement du message:", message);
    try {
      this.onSetIsTyping(true);

      // Si le message est vide, retourner non traité
      if (!message || message.trim() === "") {
        return { processed: false };
      }

      // Normaliser le message pour la recherche
      const normalizedMessage = message.toLowerCase().trim();
      console.log("Message normalisé:", normalizedMessage);

      // Chercher une correspondance dans les sujets et questions
      for (const topic of this.topics) {
        for (const question of topic.questions) {
          const normalizedQuestion = question.text.toLowerCase().trim();

          // Vérifier la correspondance exacte ou partielle
          if (
            normalizedMessage === normalizedQuestion ||
            normalizedMessage.includes(normalizedQuestion) ||
            normalizedQuestion.includes(normalizedMessage)
          ) {
            console.log(
              "Correspondance trouvée avec:",
              topic.name,
              "-",
              question.text
            );

            // Si une action est définie, l'exécuter
            if (question.action) {
              const actionResult = await this.handleAction(question.action);

              if (actionResult.success) {
                this.onHandleActionResult(actionResult);
              }

              return {
                processed: true,
                action: question.action,
                topicId: topic.id,
                questionId: question.id,
                matchedText: question.text,
              };
            }

            // Sinon, retourner une réponse statique si disponible
            if (question.response) {
              this.onAddBotMessage({
                text: question.response,
                isBot: true,
              });

              return {
                processed: true,
                response: question.response,
                topicId: topic.id,
                questionId: question.id,
                matchedText: question.text,
              };
            }
          }
        }
      }

      // Aucune correspondance trouvée
      console.log("Aucune correspondance trouvée pour le message");
      return { processed: false };
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
      return { processed: false };
    } finally {
      this.onSetIsTyping(false);
    }
  }

  /**
   * Traite une action spécifique
   * @param {string} action - Action à exécuter
   * @returns {Promise<Object>} Résultat de l'action
   */
  async handleAction(action) {
    console.log("Traitement de l'action:", action);

    try {
      this.onSetIsTyping(true);

      // Actions pour les sujets principaux
      if (action === "start_planning") {
        // Appeler la fonction de génération de planning
        if (this.onStartScheduleGeneration) {
          this.onStartScheduleGeneration();
        }

        return {
          success: true,
          response: "Je lance la génération de planning...",
          suggestions: [
            {
              text: "Confirmer",
              action: "confirm_planning",
            },
            {
              text: "Annuler",
              action: "cancel_planning",
            },
          ],
        };
      }

      // Actions pour les congés
      if (action === "check_vacations") {
        const topicConges = this.topics.find((topic) => topic.id === "conges");
        console.log(
          "Sujet congés trouvé:",
          topicConges ? topicConges.id : "non trouvé",
          "questions:",
          topicConges ? topicConges.questions.length : 0
        );

        const questionsSuggestions = topicConges
          ? topicConges.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour congés:", questionsSuggestions);

        return {
          success: true,
          response:
            "Voici les informations concernant les congés. Que souhaitez-vous savoir ?",
          suggestions:
            questionsSuggestions.length > 0
              ? questionsSuggestions
              : [
                  {
                    text: "Demander un congé",
                    action: "request_vacation",
                  },
                  {
                    text: "Voir mes congés",
                    action: "view_my_vacations",
                  },
                ],
        };
      }

      // Actions pour l'aide
      if (action === "get_help") {
        const topicAide = this.topics.find((topic) => topic.id === "aide");
        console.log(
          "Sujet aide trouvé:",
          topicAide ? topicAide.id : "non trouvé",
          "questions:",
          topicAide ? topicAide.questions.length : 0
        );

        const questionsSuggestions = topicAide
          ? topicAide.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour aide:", questionsSuggestions);

        return {
          success: true,
          response: "Voici comment je peux vous aider :",
          suggestions:
            questionsSuggestions.length > 0
              ? questionsSuggestions
              : [
                  {
                    text: "Planning",
                    action: "start_planning",
                  },
                  {
                    text: "Congés",
                    action: "check_vacations",
                  },
                  {
                    text: "Données personnalisées",
                    action: "check_data",
                  },
                ],
        };
      }

      // Actions pour les données personnalisées
      if (action === "check_data") {
        const topicDonnees = this.topics.find(
          (topic) => topic.id === "donnees"
        );
        console.log(
          "Sujet données trouvé:",
          topicDonnees ? topicDonnees.id : "non trouvé",
          "questions:",
          topicDonnees ? topicDonnees.questions.length : 0
        );

        const questionsSuggestions = topicDonnees
          ? topicDonnees.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour données:", questionsSuggestions);

        return {
          success: true,
          response: "Voici les données que je peux vous fournir :",
          suggestions:
            questionsSuggestions.length > 0
              ? questionsSuggestions
              : [
                  {
                    text: "Qui ne travaille pas aujourd'hui ?",
                    action: "get_absences_today",
                  },
                  {
                    text: "Qui sont les prochaines personnes en congés ?",
                    action: "get_upcoming_vacations",
                  },
                  {
                    text: "Manque-t-il des plannings à faire ?",
                    action: "get_missing_schedules",
                  },
                  {
                    text: "Qui a un solde d'heures négatif ?",
                    action: "get_negative_hours",
                  },
                ],
        };
      }

      // Actions pour le sujet Planning
      if (action === "topic_plannings") {
        const topicPlannings = this.topics.find(
          (topic) => topic.id === "plannings"
        );
        console.log(
          "Sujet plannings trouvé:",
          topicPlannings ? topicPlannings.id : "non trouvé",
          "questions:",
          topicPlannings ? topicPlannings.questions.length : 0
        );

        const questionsSuggestions = topicPlannings
          ? topicPlannings.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour plannings:", questionsSuggestions);

        return {
          success: true,
          response: "Voici les questions concernant la gestion des plannings :",
          suggestions: questionsSuggestions,
        };
      }

      // Actions pour le sujet Employés
      if (action === "topic_employes") {
        const topicEmployes = this.topics.find(
          (topic) => topic.id === "employes"
        );
        console.log(
          "Sujet employés trouvé:",
          topicEmployes ? topicEmployes.id : "non trouvé",
          "questions:",
          topicEmployes ? topicEmployes.questions.length : 0
        );

        const questionsSuggestions = topicEmployes
          ? topicEmployes.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour employés:", questionsSuggestions);

        return {
          success: true,
          response: "Voici les questions concernant les employés :",
          suggestions: questionsSuggestions,
        };
      }

      // Actions pour le sujet Statistiques
      if (action === "topic_statistiques") {
        const topicStats = this.topics.find(
          (topic) => topic.id === "statistiques"
        );
        console.log(
          "Sujet statistiques trouvé:",
          topicStats ? topicStats.id : "non trouvé",
          "questions:",
          topicStats ? topicStats.questions.length : 0
        );

        const questionsSuggestions = topicStats
          ? topicStats.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour statistiques:", questionsSuggestions);

        return {
          success: true,
          response: "Voici les questions concernant les statistiques :",
          suggestions: questionsSuggestions,
        };
      }

      // Actions pour le sujet Activités
      if (action === "topic_activites") {
        const topicActivites = this.topics.find(
          (topic) => topic.id === "activites"
        );
        console.log(
          "Sujet activités trouvé:",
          topicActivites ? topicActivites.id : "non trouvé",
          "questions:",
          topicActivites ? topicActivites.questions.length : 0
        );

        const questionsSuggestions = topicActivites
          ? topicActivites.questions.map((q) => ({
              text: q.text,
              action: q.action || `question_${q.id}`,
            }))
          : [];

        console.log("Suggestions pour activités:", questionsSuggestions);

        return {
          success: true,
          response: "Voici les questions concernant le suivi des activités :",
          suggestions: questionsSuggestions,
        };
      }

      // Traitement des questions directes (action commençant par "question_")
      if (action.startsWith("question_")) {
        const questionId = action.replace("question_", "");

        // Chercher la question dans tous les sujets
        for (const topic of this.topics) {
          const question = topic.questions.find((q) => q.id === questionId);
          if (question) {
            // Si la question a une action spécifique, l'exécuter
            if (question.action) {
              return await this.handleAction(question.action);
            }

            // Sinon retourner la réponse statique
            if (question.response) {
              return {
                success: true,
                response: question.response,
              };
            }
          }
        }
      }

      // Traitement des requêtes de base de données dynamiques
      if (action.startsWith("get_")) {
        console.log("Requête de base de données détectée:", action);
        return await this.handleDatabaseQuery(action);
      }

      // Action par défaut (non reconnue)
      console.warn("Action non reconnue:", action);
      return {
        success: false,
        response:
          "Je ne sais pas comment traiter cette action. Pouvez-vous reformuler ou choisir une autre option ?",
        suggestions: [
          {
            text: "Aide",
            action: "get_help",
          },
        ],
      };
    } catch (error) {
      console.error("Erreur lors du traitement de l'action:", error);
      return {
        success: false,
        response:
          "Désolé, une erreur s'est produite lors du traitement de votre demande.",
        suggestions: [
          {
            text: "Aide",
            action: "get_help",
          },
        ],
      };
    } finally {
      this.onSetIsTyping(false);
    }
  }

  /**
   * Traite une requête à la base de données
   * @param {string} action - Action de requête à exécuter
   * @returns {Promise<Object>} Résultat de la requête avec réponse formatée
   */
  async handleDatabaseQuery(action) {
    console.log("Exécution de la requête de base de données:", action);

    try {
      this.onSetIsTyping(true);

      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification non trouvé");
        return {
          success: false,
          response: "Veuillez vous connecter pour accéder à ces informations.",
        };
      }

      let endpoint = "";
      switch (action) {
        case "get_absences_today":
          endpoint = "/api/chatbot/absences/today";
          break;
        case "get_upcoming_vacations":
          endpoint = "/api/chatbot/vacations/upcoming";
          break;
        case "get_missing_schedules":
          endpoint = "/api/chatbot/schedules/missing";
          break;
        case "get_negative_hours":
          endpoint = "/api/chatbot/hours/negative";
          break;
        case "get_positive_hours":
          endpoint = "/api/chatbot/hours/positive";
          break;
        case "get_working_today":
          endpoint = "/api/chatbot/employees/working-today";
          break;
        case "get_employee_hours_today":
          endpoint = "/api/chatbot/employees/hours-today";
          break;
        default:
          return {
            success: false,
            response: "Action de requête inconnue.",
          };
      }

      console.log(`Appel de l'API: ${baseUrl}${endpoint}`);

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            return {
              success: false,
              response: "Votre session a expiré. Veuillez vous reconnecter.",
            };
          }

          if (response.status === 403) {
            return {
              success: false,
              response:
                "Vous n'avez pas les droits nécessaires pour accéder à ces informations.",
            };
          }

          const errorText = await response.text();
          console.error(`Erreur API (${response.status}):`, errorText);
          return {
            success: false,
            response: `Erreur lors de la récupération des données (${response.status}).`,
          };
        }

        const data = await response.json();
        console.log("Réponse API:", data);

        if (!data.success) {
          return {
            success: false,
            response:
              data.message || "Erreur lors de la récupération des données.",
          };
        }

        // Traitement des données selon le type de requête
        return this.processQueryResult(action, data.data);
      } catch (error) {
        console.error("Erreur réseau:", error);
        return {
          success: false,
          response:
            "Erreur de connexion au serveur. Veuillez réessayer plus tard.",
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors du traitement de la requête à la base de données:",
        error
      );
      return {
        success: false,
        response:
          "Désolé, une erreur s'est produite lors de la récupération des données.",
        suggestions: [
          {
            text: "Aide",
            action: "get_help",
          },
        ],
      };
    } finally {
      this.onSetIsTyping(false);
    }
  }

  /**
   * Traite les résultats d'une requête API et génère une réponse formatée
   * @param {string} action - Action de requête exécutée
   * @param {Array} data - Données reçues de l'API
   * @returns {Object} Réponse formatée pour l'utilisateur
   */
  processQueryResult(action, data) {
    if (!data || data.length === 0) {
      // Réponses par défaut si aucune donnée n'est trouvée
      switch (action) {
        case "get_absences_today":
          return {
            success: true,
            response: "Personne n'est absent aujourd'hui.",
          };
        case "get_upcoming_vacations":
          return {
            success: true,
            response: "Aucun congé n'est prévu prochainement.",
          };
        case "get_missing_schedules":
          return {
            success: true,
            response:
              "Tous les plannings sont à jour pour la semaine prochaine.",
          };
        case "get_negative_hours":
          return {
            success: true,
            response: "Aucun employé n'a un solde d'heures négatif.",
          };
        case "get_positive_hours":
          return {
            success: true,
            response: "Aucun employé n'a un solde d'heures positif.",
          };
        case "get_working_today":
          return {
            success: true,
            response: "Aucun employé ne travaille aujourd'hui.",
          };
        case "get_employee_hours_today":
          return {
            success: true,
            response: "Aucun employé n'est programmé pour aujourd'hui.",
          };
        default:
          return {
            success: true,
            response: "Aucune donnée trouvée.",
          };
      }
    }

    // Traitement des données selon le type de requête
    switch (action) {
      case "get_absences_today": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((employee) => {
          if (!byDepartment[employee.department]) {
            byDepartment[employee.department] = [];
          }
          byDepartment[employee.department].push(
            `${employee.name} (${employee.reason})`
          );
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, employees]) => `${dept}: ${employees.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les personnes absentes aujourd'hui sont:\n${formattedResponse}`,
        };
      }

      case "get_upcoming_vacations": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((vacation) => {
          if (!byDepartment[vacation.department]) {
            byDepartment[vacation.department] = [];
          }
          byDepartment[vacation.department].push(
            `${vacation.name} (du ${vacation.start_date} au ${vacation.end_date})`
          );
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, vacations]) => `${dept}: ${vacations.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les prochaines personnes en congés sont:\n${formattedResponse}`,
        };
      }

      case "get_missing_schedules": {
        const departmentNames = data.map((dept) => dept.name).join(", ");
        return {
          success: true,
          response: `Les départements suivants n'ont pas encore de planning pour la semaine prochaine: ${departmentNames}`,
        };
      }

      case "get_negative_hours": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((employee) => {
          if (!byDepartment[employee.department]) {
            byDepartment[employee.department] = [];
          }
          byDepartment[employee.department].push(
            `${employee.name} (${employee.balance}h)`
          );
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, employees]) => `${dept}: ${employees.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les employés avec un solde d'heures négatif sont:\n${formattedResponse}`,
        };
      }

      case "get_positive_hours": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((employee) => {
          if (!byDepartment[employee.department]) {
            byDepartment[employee.department] = [];
          }
          byDepartment[employee.department].push(
            `${employee.name} (${employee.balance}h)`
          );
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, employees]) => `${dept}: ${employees.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les employés avec un solde d'heures positif sont:\n${formattedResponse}`,
        };
      }

      case "get_working_today": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((employee) => {
          if (!byDepartment[employee.department]) {
            byDepartment[employee.department] = [];
          }
          byDepartment[employee.department].push(employee.name);
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, employees]) => `${dept}: ${employees.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les employés qui travaillent aujourd'hui sont:\n${formattedResponse}`,
        };
      }

      case "get_employee_hours_today": {
        // Regrouper par département
        const byDepartment = {};
        data.forEach((employee) => {
          if (!byDepartment[employee.department]) {
            byDepartment[employee.department] = [];
          }
          byDepartment[employee.department].push(
            `${employee.name} (${employee.start_time}-${employee.end_time}, ${employee.hours}h)`
          );
        });

        // Formater la réponse par département
        const formattedResponse = Object.entries(byDepartment)
          .map(([dept, employees]) => `${dept}: ${employees.join(", ")}`)
          .join("\n");

        return {
          success: true,
          response: `Les horaires des employés aujourd'hui sont:\n${formattedResponse}`,
        };
      }

      default:
        return {
          success: true,
          response:
            "Données récupérées avec succès mais le formatage n'est pas défini pour cette action.",
        };
    }
  }
}

export default ChatbotRulesIntegration;
