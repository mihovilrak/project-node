import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../..',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/integration/**/*.test.ts',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup/integration.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  testTimeout: 30000, // Longer timeout for integration tests
  // Don't collect coverage for integration tests
  collectCoverage: false,
}

export default config;
