// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
declare module 'rimraf' {
  import fs from 'node:fs';

  export function sync(path: string, options?: Options): void;

  export interface Options {
    maxBusyTries?: number;
    emfileWait?: number;
    /** @default false */
    disableGlob?: boolean;
    glob?: { nosort: boolean; silent: boolean } | false;

    unlink?: typeof fs.unlink;
    chmod?: typeof fs.chmod;
    stat?: typeof fs.stat;
    lstat?: typeof fs.lstat;
    rmdir?: typeof fs.rmdir;
    readdir?: typeof fs.readdir;
    unlinkSync?: typeof fs.unlinkSync;
    chmodSync?: typeof fs.chmodSync;
    statSync?: typeof fs.statSync;
    lstatSync?: typeof fs.lstatSync;
    rmdirSync?: typeof fs.rmdirSync;
    readdirSync?: typeof fs.readdirSync;
  }
}

declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        /** SDK Version, which is injected via vitest or tsup from package.json */
        COZELOOP_VERSION: string;
        COZELOOP_API_TOKEN?: string;
        COZELOOP_WORKSPACE_ID?: string;
      }
    }
  }
}
