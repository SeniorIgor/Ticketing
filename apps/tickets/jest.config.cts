module.exports = {
  displayName: '@org/tickets',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  maxWorkers: 4,
  coverageDirectory: '<rootDir>/coverage',
};
