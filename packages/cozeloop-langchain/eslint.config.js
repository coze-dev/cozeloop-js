const { defineConfig } = require('@loop-infra/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'node',
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'max-params': ['warn', { max: 4 }],
  },
});
