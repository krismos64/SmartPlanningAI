module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["**/__tests__/**/ChatbotRulesIntegration.test.js"],
  setupFiles: ["./jest.setup.js"],
};
