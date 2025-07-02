import { defineConfig } from '@loop-infra/vitest-config';

import packageJson from './package.json';

export default defineConfig({
  dirname: __dirname,
  preset: 'node',
  test: {
    testTimeout: 120_000,
    coverage: {
      all: false,
      exclude: ['tsup.config.ts'],
    },
    env: {
      COZELOOP_VERSION: packageJson.version,
    },
  },
});
