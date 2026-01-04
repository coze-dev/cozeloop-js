// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { type BaseApiResp } from '../../base';
import {
  type LoopMessage,
  type LoopTool,
  type LoopToolCallConfig,
  type VariableDef,
} from './common';

export interface PromptQuery {
  /** prompt_key */
  prompt_key?: string;
  /** prompt版本 */
  version?: string;
  /** prompt版本标识（如果version不为空，该字段会被忽略） */
  label?: string;
}

export interface PullPromptReq {
  workspace_id: string;
  queries: PromptQuery[];
}

export interface PromptTemplate {
  template_type: 'normal' | 'jinja2';
  messages: LoopMessage[];
  variable_defs: VariableDef[];
}

export interface LLMConfig {
  temperature?: number;
  max_tokens?: number;
  top_k?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  json_mode?: boolean;
}

export interface Prompt {
  workspace_id: string;
  prompt_key: string;
  version: string;
  prompt_template: PromptTemplate;
  tools: LoopTool[];
  tool_call_config?: LoopToolCallConfig;
  llm_config: LLMConfig;
}

export interface PromptResultItem {
  query: PromptQuery;
  prompt: Prompt;
}

export type PullPromptResp = BaseApiResp<{ items: PromptResultItem[] }>;
