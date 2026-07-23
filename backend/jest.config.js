module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000, // mongodb-memory-server's first download/boot can be slow
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/**"],
  coverageThreshold: {
    global: { statements: 60, branches: 50, functions: 60, lines: 60 },
  },
  testPathIgnorePatterns: ["/node_modules/"],
};
