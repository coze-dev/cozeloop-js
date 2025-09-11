// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { type BaseApiResp } from '../../base';
import { type PromptQuery } from './prompt';
import { type VariableVal, type LoopMessage } from './common';

export interface ExecutePromptReq {
  /** 工作空间ID */
  workspace_id?: string;
  /** Prompt 标识 */
  prompt_identifier?: PromptQuery;
  /** 变量值 */
  variable_vals?: VariableVal[];
  /** 消息 */
  messages?: LoopMessage[];
}

export interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
}

export interface ExecutePromptReply {
  message: LoopMessage;
  finish_reason: string;
  usage: TokenUsage;
}

export type ExecutePromptResp = BaseApiResp<ExecutePromptReply>;

export type StreamingExecutePromptResp = AsyncGenerator<ExecutePromptReply>;
