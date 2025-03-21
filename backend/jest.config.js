module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["text", "lcov", "clover", "html"],
  testPathIgnorePatterns: ["/node_modules/"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: ["**/__tests__/**/*.js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
};
