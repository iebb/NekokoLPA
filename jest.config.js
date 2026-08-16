/**
 * The LPA core (src/lpa/core) is plain TypeScript with no React Native
 * imports, so it runs under babel-jest without the react-native preset.
 */
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
