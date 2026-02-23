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
  coverageDirectory: '<rootDir>/src/__tests__/coverage',
};
