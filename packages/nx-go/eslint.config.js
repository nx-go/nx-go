const baseConfig = require('../../eslint.config.js');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.json'],
    rules: { '@nx/dependency-checks': 'error' },
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
  {
    files: [
      './package.json',
      './generators.json',
      './executors.json',
      './migrations.json',
    ],
    rules: { '@nx/nx-plugin-checks': 'error' },
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
];
