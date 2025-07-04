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
      COZELOOP_WORKSPACE_ID: '7308703665823416358',
      COZELOOP_API_TOKEN: 'pat_xxx',
      GPT_OPEN_API_KEY: 'xxxx',
    },
  },
});
