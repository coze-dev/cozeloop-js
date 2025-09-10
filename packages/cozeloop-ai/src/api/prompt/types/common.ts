// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export type LoopContentType =
  | 'text'
  | 'image_url'
  | 'base64_data'
  | 'multi_part_variable';

export interface LoopContentPart {
  type: LoopContentType;
  text?: string;
  image_url?: string;
  base64_data?: string;
}

export type LoopRole = 'system' | 'user' | 'tool' | 'assistant' | 'placeholder';

export interface LoopMessage {
  /** 角色 */
  role: LoopRole;
  /** 消息内容 */
  content?: string;
  /** 多模态内容 */
  parts?: LoopContentPart[];
  /** 推理思考内容 */
  reasoning_content?: string;
  /** tool调用ID（role为tool时有效） */
  tool_call_id?: string;
  /** tool调用（role为assistant时有效） */
  tool_calls?: LoopToolCall[];
}

export interface LoopTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: string;
  };
}

export interface LoopToolCall {
  index?: number;
  id?: string;
  type?: 'function';
  function_call?: {
    name?: string;
    arguments?: string;
  };
}

export interface LoopToolCallConfig {
  tool_choice?: 'auto' | 'none';
}

export type VariableType =
  | 'string'
  | 'boolean'
  | 'integer'
  | 'float'
  | 'object'
  | 'array<string>'
  | 'array<boolean>'
  | 'array<integer>'
  | 'array<float>'
  | 'array<object>'
  | 'placeholder'
  | 'multi_part';

export interface VariableDef {
  key: string;
  type: VariableType;
  desc?: string;
}

export interface VariableVal {
  /** 变量key */
  key?: string;
  /** 普通变量值（非string类型，如boolean、integer、float、object等，序列化后传入）*/
  value?: string;
  /** placeholder变量值 */
  placeholder_messages?: LoopMessage[];
  /** 多模态变量值 */
  multi_part_values?: LoopContentPart[];
}
