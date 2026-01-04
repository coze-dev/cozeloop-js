// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type SimpleLogger } from '../utils/logger';
import {
  type PromptQuery,
  type ApiClient,
  type ApiClientOptions,
  type VariableDef,
} from '../api';

export interface PromptCacheOptions {
  /** Cache refresh interval, @default 60_000 ms */
  refreshInterval?: number;
  /** Cache size (by prompt count, LRU) @default 100 */
  maxSize?: number;
}

export interface ContentPartText {
  type: 'text';
  text: string;
}

export interface ContentPartImage {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

export type ContentPart = ContentPartText | ContentPartImage;

export interface ToolCall {
  id?: string;
  type?: 'function';
  function: {
    name?: string;
    arguments?: string;
  };
}

export interface Message {
  role: 'system' | 'user' | 'tool' | 'assistant';
  content?: string;
  parts?: (ContentPartText | ContentPartImage)[];
  reasoning_content?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface PromptHubOptions {
  /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  workspaceId?: string;
  /** The Loop {@link ApiClient} instance or {@link ApiClientOptions} */
  apiClient?: ApiClient | ApiClientOptions;
  /** Prompt cache options, see {@link PromptCacheOptions } */
  cacheOptions?: PromptCacheOptions;
  /** Enable trace report for `getPrompt` and `formatPrompt` */
  traceable?: boolean;
  /** A logger function to print debug message */
  logger?: SimpleLogger;
}

export type PromptVariables =
  | Record<
      string,
      | string
      | number
      | bigint
      | boolean
      | symbol
      | Message
      | Message[]
      | ContentPart[]
    >
  | Record<string, unknown>;

export type PromptVariableMap = Record<
  string,
  | { def: VariableDef; value?: PromptVariables[keyof PromptVariables] }
  | undefined
>;

export interface PromptAsAServiceOptions {
  /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  workspaceId?: string;
  /** The Loop {@link ApiClient} instance or {@link ApiClientOptions} */
  apiClient?: ApiClient | ApiClientOptions;
  /** Prompt identified by prompt query */
  prompt?: PromptQuery;
  /** Enable trace report for `invoke` and `stream` */
  traceable?: boolean;
  /** A logger function to print debug message */
  logger?: SimpleLogger;
}

export interface PromptExecuteOptions {
  /** Prompt identified by prompt query */
  prompt?: PromptQuery;
  /** Messages */
  messages: Message[];
  /** variable values of Prompt */
  variables?: PromptVariables;
}
