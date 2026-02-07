module.exports = {
  displayName: '@org/orders',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
};
