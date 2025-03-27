import { CHATBOT_TOPICS } from "../../config/chatbotTopics";

/**
 * Classe d'intégration des règles et logiques du chatbot
 * Gère la communication avec le backend et le traitement des messages
 */
class ChatbotRulesIntegration {
  /**
   * Initialise l'intégration du chatbot
   * @param {Object} options - Options de configuration
   * @param {Function} options.onAddBotMessage - Callback pour ajouter un message du bot
   * @param {Function} options.onSetIsTyping - Callback pour indiquer que le bot est en train d'écrire
   * @param {Function} options.onHandleActionResult - Callback pour traiter le résultat d'une action
   * @param {Function} options.onStartScheduleGeneration - Callback pour démarrer la génération d'un planning
   */
  constructor(options = {}) {
    // Callbacks
    this.onAddBotMessage = options.onAddBotMessage || (() => {});
    this.onSetIsTyping = options.onSetIsTyping || (() => {});
    this.onHandleActionResult = options.onHandleActionResult || (() => {});
    this.onStartScheduleGeneration =
      options.onStartScheduleGeneration || (() => {});
  }

  /**
   * Traite un message entrant et détermine s'il correspond à une question prédéfinie
   * @param {string} message - Le message à traiter
   * @returns {Object} Résultat du traitement
   */
  async processMessage(message) {
    if (this.onSetIsTyping) {
      this.onSetIsTyping(true);
    }

    try {
      // Chercher si le message correspond à une question prédéfinie
      let matchedQuestion = null;

      // Parcourir tous les sujets et leurs questions
      for (const topic of CHATBOT_TOPICS) {
        for (const question of topic.questions) {
          if (this.isMessageMatchingQuestion(message, question.text)) {
            matchedQuestion = question;
            break;
          }
        }
        if (matchedQuestion) break;
      }

      if (matchedQuestion) {
        // Si c'est une question avec réponse dynamique (via API)
        if (matchedQuestion.dynamicResponse) {
          const result = await this.handleAction(matchedQuestion.action);
          return { processed: true, action: matchedQuestion.action };
        }
        // Si c'est une question avec réponse statique
        else if (matchedQuestion.response) {
          this.onAddBotMessage({
            text: matchedQuestion.response,
            isBot: true,
            suggestions: matchedQuestion.suggestions || [],
          });
          return { processed: true, action: null };
        }
      }

      // Si aucune correspondance n'est trouvée
      this.onAddBotMessage({
        text: "Je ne comprends pas votre question. Pourriez-vous la reformuler ou choisir l'une des suggestions ci-dessous ?",
        isBot: true,
        suggestions: [
          { text: "Aide", action: "get_help" },
          { text: "Données personnalisées", action: "check_data" },
        ],
      });

      return { processed: true, action: null };
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);

      this.onAddBotMessage({
        text: "Désolé, une erreur s'est produite lors du traitement de votre demande.",
        isBot: true,
      });

      return { processed: false, error: error.message };
    } finally {
      if (this.onSetIsTyping) {
        this.onSetIsTyping(false);
      }
    }
  }

  /**
   * Vérifie si un message correspond à une question prédéfinie
   * @param {string} message - Le message utilisateur
   * @param {string} questionText - Le texte de la question prédéfinie
   * @returns {boolean} Vrai si le message correspond à la question
   */
  isMessageMatchingQuestion(message, questionText) {
    // Simplifier le message et la question pour la comparaison
    const normalizedMessage = this.normalizeText(message);
    const normalizedQuestion = this.normalizeText(questionText);

    // Correspondance directe
    if (normalizedMessage === normalizedQuestion) {
      return true;
    }

    // Correspondance partielle (contient les mots-clés principaux)
    const messageWords = normalizedMessage.split(" ");
    const questionWords = normalizedQuestion.split(" ");

    // Trouver les mots clés (mots de plus de 3 caractères)
    const keywordsQuestion = questionWords.filter((word) => word.length > 3);
    const matchCount = keywordsQuestion.filter((keyword) =>
      messageWords.some(
        (word) => word.includes(keyword) || keyword.includes(word)
      )
    ).length;

    // Si plus de 70% des mots-clés correspondent
    const matchRatio =
      keywordsQuestion.length > 0 ? matchCount / keywordsQuestion.length : 0;
    return matchRatio > 0.7;
  }

  /**
   * Normalise un texte pour la comparaison
   * @param {string} text - Texte à normaliser
   * @returns {string} Texte normalisé
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[.,?!;:'"()\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Exécute une action prédéfinie
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de l'action
   */
  async handleAction(action) {
    if (this.onSetIsTyping) {
      this.onSetIsTyping(true);
    }

    try {
      // Actions spéciales qui ne nécessitent pas d'appel au backend
      if (action.startsWith("topic_")) {
        return this.handleTopicAction(action);
      }

      // Actions qui génèrent des plannings
      if (action === "generate_schedule") {
        if (this.onStartScheduleGeneration) {
          this.onStartScheduleGeneration();
        }
        return {
          success: true,
          response:
            "J'ai lancé la génération du planning. Vous serez notifié quand ce sera terminé.",
        };
      }

      // Requêtes à la base de données via l'API
      const result = await this.handleDatabaseQuery(action);

      if (this.onHandleActionResult) {
        this.onHandleActionResult(result);
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'action:", error);

      const errorResult = {
        success: false,
        error: error.message,
        response:
          "Désolé, une erreur s'est produite lors de l'exécution de cette action.",
      };

      if (this.onHandleActionResult) {
        this.onHandleActionResult(errorResult);
      }

      return errorResult;
    } finally {
      if (this.onSetIsTyping) {
        this.onSetIsTyping(false);
      }
    }
  }

  /**
   * Gère les actions liées à la sélection d'un sujet
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de l'action
   */
  handleTopicAction(action) {
    const topicId = action.replace("topic_", "");
    const topic = CHATBOT_TOPICS.find((t) => t.id === topicId);

    if (!topic) {
      return {
        success: false,
        response: "Désolé, je ne peux pas trouver d'informations sur ce sujet.",
      };
    }

    // Créer des suggestions à partir des questions du sujet
    const suggestions = topic.questions.map((q) => ({
      text: q.text,
      action: q.action || q.id,
    }));

    return {
      success: true,
      response: `Voici les questions fréquentes sur "${topic.name}":`,
      suggestions,
    };
  }

  /**
   * Exécute une requête à la base de données via l'API
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de la requête
   */
  async handleDatabaseQuery(action) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return {
          success: false,
          response: "Vous devez être connecté pour effectuer cette action.",
        };
      }

      const response = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Erreur de réponse serveur");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
      return {
        success: false,
        error: error.message || "Erreur inconnue",
        response:
          "Désolé, une erreur s'est produite lors de la communication avec le serveur.",
      };
    }
  }
}

export default ChatbotRulesIntegration;
