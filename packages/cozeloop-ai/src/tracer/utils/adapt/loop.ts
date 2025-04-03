// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type PromptVariables } from '../../../prompt/types';
import {
  type LoopTraceLLMCallMessage,
  type LoopTracePromptTemplateInput,
  type Message,
} from '../../../api';

export function toLoopTraceSpanPromptTemplateInput(
  messages?: Message[],
  variables?: PromptVariables,
): LoopTracePromptTemplateInput {
  return {
    templates: toLoopTraceSpanPromptTemplateMessages(messages),
    arguments: Object.entries(variables || {}).map(([key, value]) => ({
      key,
      value,
    })),
  };
}

export function toLoopTraceSpanPromptTemplateMessages(
  messages?: Message[],
): LoopTraceLLMCallMessage[] | undefined {
  return messages?.map(message => ({
    role: message.role as LoopTraceLLMCallMessage['role'],
    content: message.content,
  }));
}
