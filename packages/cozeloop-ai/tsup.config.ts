import { defineConfig } from 'tsup';
import rimraf from 'rimraf';

import packageJson from './package.json';

export default defineConfig(() => {
  const outDir = 'dist';
  // tsup clean will leave empty dirs, using rimraf to ensure clean task
  // see https://github.com/egoist/tsup/issues/984#issuecomment-1930681601
  rimraf.sync(outDir);

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
