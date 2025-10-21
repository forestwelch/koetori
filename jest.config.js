const nextJest = require("next/jest");

// This creates a Jest config using Next.js's built-in Jest configuration
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // If using TypeScript with a baseUrl set to the root directory
  // then you need the below for alias' to work
  moduleDirectories: ["node_modules", "<rootDir>/"],

  // Handle module aliases (if you have any in your tsconfig)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
  },

  // Test environment
  testEnvironment: "jest-environment-jsdom",

  // Ignore these folders during testing
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Coverage settings
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/api/**",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
