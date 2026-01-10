/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'detox/runners/jest/reporter',
    [
      'jest-html-reporter',
      {
        pageTitle: 'QuizApp E2E Test Report',
        outputPath: 'e2e/test-reports/e2e-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        sort: 'status',
        theme: 'lightTheme',
        executionTimeWarningThreshold: 5,
        collapseSuitesByDefault: false,
        append: false,
      },
    ],
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
