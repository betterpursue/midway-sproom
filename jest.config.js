module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures', '<rootDir>/src/script'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/src/script'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/script/**',
  ],
  setupFilesAfterEnv: [],
  clearMocks: true,
  resetMocks: true,
};