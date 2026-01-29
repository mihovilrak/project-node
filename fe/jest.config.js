/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // MSW v1 works with standard jsdom
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // CI runners are slower; avoid timeout flakiness (default 5000)
  testTimeout: process.env.CI ? 15000 : 5000,
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js"
  },
  transform: {
    "^.+\\.(ts|tsx)$": ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }],
    "^.+\\.(js|jsx|mjs|cjs|es\\.js)$": ['babel-jest', { rootMode: 'upward' }]
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@mui|@emotion|mui-color-input|react-router-dom|@mswjs|msw|web-streams-polyfill|@open-draft|outvariant|headers-polyfill|until-async|rettime|tagged-tag|yoctocolors-cjs|@inquirer)).+"
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[tj]sx?$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/',
    '/dist/',
    '/build/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};