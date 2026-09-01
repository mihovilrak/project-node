import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../..',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
  coverageDirectory: '<rootDir>/src/__tests__/coverage',
  coverageThreshold: {
    global: { statements: 73, branches: 70, functions: 77, lines: 72 },
  },
  clearMocks: true,
  restoreMocks: true,
};

export default config;
