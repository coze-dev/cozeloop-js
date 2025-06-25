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
      COZELOOP_WORKSPACE_ID: '7480080243929694252',
      // OTEL_EXPORTER_OTLP_ENDPOINT:
      // 'https://api-bot-boe.bytedance.net/v1/loop/opentelemetry/v1/traces',
      COZELOOP_API_TOKEN:
        'pat_zaguQ3FIZNicL5GZUgoSgLeXRg7dieSxpSWaQ4DaE3YKMr30dwzNz829Qqg5qJl0',
    },
  },
});
