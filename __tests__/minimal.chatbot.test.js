// Test minimal pour valider la configuration Jest
const { CHATBOT_TOPICS } = require("./chatbotTopics.mock");

describe("Test minimal chatbot", () => {
  test('Le sujet "donnees" existe dans CHATBOT_TOPICS', () => {
    const donneesSubject = CHATBOT_TOPICS.find(
      (topic) => topic.id === "donnees"
    );
    expect(donneesSubject).toBeDefined();
  });
});
