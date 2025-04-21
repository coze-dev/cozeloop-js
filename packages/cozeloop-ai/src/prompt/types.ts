// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type SimpleLogger } from '../utils/logger';
import {
  type ApiClient,
  type ApiClientOptions,
  type Message,
  type VariableDef,
} from '../api';

export interface PromptCacheOptions {
  /** Cache refresh interval, @default 60_000 ms */
  refreshInterval?: number;
  /** Cache size (by prompt count, LRU) @default 100 */
  maxSize?: number;
}

export interface PromptHubOptions {
  /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  workspaceId?: string;
  /** The Loop {@link ApiClient} instance or {@link ApiClientOptions} */
  apiClient?: ApiClient | ApiClientOptions;
  /** Prompt cache options, see {@link PromptCacheOptions } */
  cacheOptions?: PromptCacheOptions;
  /** Enavle trace report for `getPrompt` and `formatPrompt` */
  traceable?: boolean;
  /** A logger function to print debug message */
  logger?: SimpleLogger;
}

export type PromptVariables = Record<
  string,
  string | number | bigint | boolean | symbol | Message | Message[]
>;

export type PromptVariableMap = Record<
  string,
  | { def: VariableDef; value?: PromptVariables[keyof PromptVariables] }
  | undefined
>;
