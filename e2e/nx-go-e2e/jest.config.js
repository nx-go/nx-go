module.exports = {
  displayName: 'nx-go-e2e',
  preset: '../../jest.preset.js',
  globals: {},
  testTimeout: 1200000,
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/e2e/nx-go-e2e',
}
