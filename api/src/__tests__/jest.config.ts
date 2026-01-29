import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/__tests__/coverage',
}

export default config;
