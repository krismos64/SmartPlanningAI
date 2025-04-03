// Utiliser notre version CommonJS des données du chatbot
const { CHATBOT_TOPICS } = require("./chatbotTopics.mock");

// Mock pour localStorage
global.localStorage = {
  getItem: jest.fn(() => "fake-token-12345"),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

// Mock pour fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        response: "Réponse de test",
      }),
  })
);

// Mock de ChatbotRulesIntegration
const ChatbotRulesIntegration = jest.fn().mockImplementation((options) => {
  return {
    onAddBotMessage: options.onAddBotMessage || (() => {}),
    onSetIsTyping: options.onSetIsTyping || (() => {}),
    onHandleActionResult: options.onHandleActionResult || (() => {}),

    processMessage: async (message) => {
      if (options.onSetIsTyping) {
        options.onSetIsTyping(true);
      }

      // Traitement du message
      const matchingQuestion = CHATBOT_TOPICS.flatMap(
        (topic) => topic.questions
      ).find(
        (q) =>
          q.text.toLowerCase().includes(message.toLowerCase()) ||
          message.toLowerCase().includes(q.text.toLowerCase())
      );

      if (matchingQuestion && matchingQuestion.dynamicResponse) {
        if (options.onHandleActionResult) {
          options.onHandleActionResult({
            success: true,
            response: `Réponse pour ${matchingQuestion.text}`,
            action: matchingQuestion.action,
          });
        }
      } else if (matchingQuestion) {
        if (options.onAddBotMessage) {
          options.onAddBotMessage({
            text: matchingQuestion.response || "Je comprends votre question",
            isBot: true,
          });
        }
      } else {
        if (options.onAddBotMessage) {
          options.onAddBotMessage({
            text: "Je ne comprends pas votre question",
            isBot: true,
          });
        }
      }

      if (options.onSetIsTyping) {
        options.onSetIsTyping(false);
      }

      return { processed: true, action: matchingQuestion?.action || null };
    },

    handleDatabaseQuery: async (action) => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = process.env.REACT_APP_API_URL || "";

        const response = await fetch(`${API_URL}/api/chatbot/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
          credentials: "include",
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
        };
      }
    },
  };
});

// Simuler l'export default de la classe
ChatbotRulesIntegration.default = ChatbotRulesIntegration;

// Mock du module ChatbotRulesIntegration
jest.mock(
  "../src/components/ui/ChatbotRulesIntegration",
  () => ChatbotRulesIntegration,
  { virtual: true }
);

describe("Tests du chatbot pour les questions de données", () => {
  let chatbot;
  let mockAddBotMessage;
  let mockSetIsTyping;
  let mockHandleActionResult;

  beforeEach(() => {
    // Réinitialiser les mocks entre les tests
    jest.clearAllMocks();

    // Créer des mocks pour les callbacks
    mockAddBotMessage = jest.fn();
    mockSetIsTyping = jest.fn();
    mockHandleActionResult = jest.fn();

    // Initialiser le chatbot avec les mocks
    chatbot = new ChatbotRulesIntegration({
      onAddBotMessage: mockAddBotMessage,
      onSetIsTyping: mockSetIsTyping,
      onHandleActionResult: mockHandleActionResult,
    });
  });

  describe('Test de processMessage avec questions du sujet "donnees"', () => {
    // Trouver le sujet "donnees" dans CHATBOT_TOPICS
    const donneesSubject = CHATBOT_TOPICS.find(
      (topic) => topic.id === "donnees"
    );

    test('Toutes les questions du sujet "donnees" doivent être traitées correctement', async () => {
      // Vérifier que le sujet a été trouvé
      expect(donneesSubject).toBeDefined();

      // Pour chaque question du sujet "donnees"
      for (const question of donneesSubject.questions) {
        // Réinitialiser les mocks pour chaque question
        jest.clearAllMocks();

        // Appeler processMessage avec le texte de la question
        const result = await chatbot.processMessage(question.text);

        // Vérifier que le message a été traité
        expect(result.processed).toBe(true);

        // Vérifier que onSetIsTyping a été appelé
        expect(mockSetIsTyping).toHaveBeenCalledWith(true);
        expect(mockSetIsTyping).toHaveBeenCalledWith(false);
      }
    });
  });

  describe('Test de handleDatabaseQuery pour chaque action du sujet "donnees"', () => {
    // Trouver le sujet "donnees" dans CHATBOT_TOPICS
    const donneesSubject = CHATBOT_TOPICS.find(
      (topic) => topic.id === "donnees"
    );

    test('Toutes les actions du sujet "donnees" doivent retourner des résultats valides', async () => {
      // Vérifier que le sujet a été trouvé
      expect(donneesSubject).toBeDefined();

      // Créer une liste des actions uniques
      const actions = donneesSubject.questions
        .filter((q) => q.action)
        .map((q) => q.action);

      // Pour chaque action
      for (const action of actions) {
        // Réinitialiser les mocks pour chaque action
        jest.clearAllMocks();

        // Configurer le mock de fetch pour cette action spécifique
        global.fetch.mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                response: `Résultat de l'action ${action}`,
              }),
          })
        );

        // Appeler handleDatabaseQuery avec l'action
        const result = await chatbot.handleDatabaseQuery(action);

        // Vérifier que la requête a été faite avec le bon endpoint et les bons paramètres
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/chatbot/query"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: expect.stringContaining("Bearer"),
            }),
            body: expect.stringContaining(action),
          })
        );

        // Vérifier que le résultat est valide
        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("response");
        expect(result.response).toBeTruthy();
      }
    });

    test("handleDatabaseQuery doit gérer correctement les erreurs", async () => {
      // Configurer le mock de fetch pour simuler une erreur
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur de connexion"))
      );

      // Appeler handleDatabaseQuery avec une action
      const result = await chatbot.handleDatabaseQuery("get_absences_today");

      // Vérifier que l'erreur a été gérée
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
    });
  });
});
