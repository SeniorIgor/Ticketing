module.exports = {
  displayName: '@org/auth',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
};
