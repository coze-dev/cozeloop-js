// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        /** SDK Version, which is injected via vitest or tsup from package.json */
        COZELOOP_VERSION: string;
      }
    }
  }
}
