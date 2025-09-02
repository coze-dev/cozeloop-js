// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import type { BaseApiResp } from '../base';

export interface TemplateContentPart {
  /** variable type */
  type: 'text' | 'multi_part_variable';
  /** variable name */
  text: string;
}

export interface TemplateMessage {
  role: 'system' | 'user' | 'assistant' | 'placeholder';
  content: string;
  parts?: TemplateContentPart[];
}

export interface VariableDef {
  key: string;
  type: 'string' | 'placeholder' | 'multi_part';
  desc?: string;
}

export interface PromptTemplate {
  template_type: 'normal' | 'jinja2';
  messages: TemplateMessage[];
  variable_defs: VariableDef[];
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: string;
  };
}

export interface ToolCallConfig {
  tool_choice?: 'auto' | 'none';
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
  tools: Tool[];
  tool_call_config?: ToolCallConfig;
  llm_config: LLMConfig;
}

export interface PromptQuery {
  prompt_key: string;
  version?: string;
}

export interface PullPromptReq {
  workspace_id: string;
  queries: PromptQuery[];
}

export interface PromptResultItem {
  query: PromptQuery;
  prompt: Prompt;
}

export type PullPromptResp = BaseApiResp<{ items: PromptResultItem[] }>;
