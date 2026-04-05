module.exports = {
  displayName: '@org/event-bus-bootstrap',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
};
