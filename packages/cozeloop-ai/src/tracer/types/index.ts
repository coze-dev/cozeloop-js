// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export enum SpanKind {
  PromptHub = 'prompt_hub',
  PromptTemplate = 'prompt_template',
  Model = 'model',
  Retriever = 'retriever',
  Tool = 'tool',
}

export type SpanType = SpanKind | string;

export type { LoopTraceInitializeOptions } from './initialize';
export type { LoopTraceWrapperOptions } from './wrapper';

export type SerializedTagValue = string | number | boolean;
