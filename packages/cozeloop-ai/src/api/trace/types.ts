// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import type { ReadStream } from 'node:fs';
import type { Blob } from 'buffer';

import type { BaseApiResp } from '../base';

export interface CozeLoopTraceSpan {
  /** Span start time */
  started_at_micros: number;
  /** LogID */
  logid?: string;
  /** SpanID */
  span_id: string;
  /** Parent SpanID */
  parent_id: string;
  /** TraceID */
  trace_id: string;
  /** Span duration */
  duration: number;
  /** PSM */
  psm?: string;
  /** CallType */
  call_type?: string;
  /** Workspace ID */
  workspace_id: string;
  /** Span name */
  span_name: string;
  /** Span type */
  span_type: string;
  /** Method name */
  method: string;
  /** Status code */
  status_code: number;
  /** Input */
  input: string;
  /** Output */
  output: string;
  /** Latency of first response */
  latency_first_resp?: number;
  /** Object storage information */
  object_storage?: string;
  /** System tags of string type */
  system_tags_string?: Record<string, string>;
  /** System tags of long type */
  system_tags_long?: Record<string, number>;
  /** System tags of double type */
  system_tags_double?: Record<string, number>;
  /** Custom tags of string type */
  tags_string?: Record<string, string>;
  /** Custom tags of long type */
  tags_long?: Record<string, number>;
  /** Custom tags of double type */
  tags_double?: Record<string, number>;
  /** Custom tags of boolean type (for backward compatibility) */
  tags_bool?: Record<string, boolean>;
  /** Custom tags of byte type (for backward compatibility) */
  tags_bytes?: Record<string, string>;
}

export interface Attachments {
  field: 'input' | 'output';
  name: string;
  type: 'text' | 'image' | 'file';
  tos_key: string;
}

export interface ObjectStorage {
  input_tos_key: string;
  output_tos_key: string;
  attachments: Attachments[];
}

export interface LoopTraceLLMCallMessagePart {
  type: 'text' | 'image_url' | 'file_url';
  text?: string;
  image_url?: {
    name?: string;
    url?: string;
    detail?: string;
  };
  file_url?: {
    name?: string;
    url?: string;
    detail?: string;
    suffix?: string;
  };
}

export interface LoopTraceLLMCallMessage {
  role: 'user' | 'system' | 'assistant' | 'tool';
  content?: string;
  parts?: LoopTraceLLMCallMessagePart[];
  name?: string;
  tool_calls?: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
  tool_call_id?: string;
}

export interface LoopTraceLLMCallChoice {
  index: number;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  message: LoopTraceLLMCallMessage;
}

export interface LoopTraceLLMCallInput {
  messages?: LoopTraceLLMCallMessage[];
  tools?: {
    type: 'function';
    function: {
      name?: string;
      description?: string;
      parameters?: Record<string, unknown>;
    };
  }[];
  tool_choice?: {
    type: 'none' | 'auto' | 'required' | 'function';
    function?: {
      name?: string;
    };
  };
}

export interface LoopTraceLLMCallOutput {
  choices: LoopTraceLLMCallChoice[];
}

export interface ReportTraceReq {
  spans: CozeLoopTraceSpan[];
}

export type ReportTraceResp = BaseApiResp;

export interface UploadFileReq {
  workspace_id: string;
  tos_key: string;
  file: Blob | File | ReadStream | Buffer;
}

export interface FileInfo {
  bytes: number;
  file_name: string;
}
export type UploadFileResp = BaseApiResp<FileInfo>;

export interface LoopTracePromptTemplateArgument {
  key?: string;
  value?: unknown;
}

export interface LoopTracePromptTemplateInput {
  templates?: LoopTraceLLMCallMessage[];
  arguments?: LoopTracePromptTemplateArgument[];
}

export interface LoopTraceRunTime {
  language: 'go' | 'python' | 'ts';
  loop_sdk_version?: string;
  scene?: string;
  library?: 'eino' | 'langchain';
  library_version?: string;
}
