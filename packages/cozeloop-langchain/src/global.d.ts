// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        /** SDK Version, which is injected via vitest or tsup from package.json */
        COZELOOP_VERSION: string;
        /** API token */
        COZELOOP_API_TOKEN?: string;
        /** Workspace id */
        COZELOOP_WORKSPACE_ID?: string;
        /** OTLP Endpoint, @default 'https://api.coze.cn/v1/loop/opentelemetry/v1/traces' */
        COZELOOP_OTLP_ENDPOINT?: string;
      }
    }
  }
}
