/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testRegex: "ChatbotRulesIntegration.test.js",
  rootDir: "..",
  setupFiles: ["<rootDir>/__tests__/jest.setup.js"],
  transformIgnorePatterns: ["/node_modules/"],
};

module.exports = config;
