import { rmdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import packageJson from './package.json';

function clearOutDir(outDir: string) {
  try {
    rmdirSync(outDir);
  } catch {
    // no-catch
  }
}

export default defineConfig(() => {
  const outDir = 'dist';
  clearOutDir(outDir);

  return {
    entry: ['./src/index.ts'],
    outDir,
    splitting: false,
    tsconfig: './tsconfig.build.json',
    format: ['cjs', 'esm'],
    dts: false,
    onSuccess: 'tsc -b ./tsconfig.typings.json',
    env: {
      COZELOOP_VERSION: packageJson.version,
    },
  };
});
