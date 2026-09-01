/** Used when Jest is run from api/ without --config (e.g. npx jest path). Ensures ts-jest is used. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
  coverageDirectory: '<rootDir>/src/__tests__/coverage',
  coverageThreshold: {
    global: { statements: 73, branches: 70, functions: 77, lines: 72 },
  },
  clearMocks: true,
  restoreMocks: true,
};
