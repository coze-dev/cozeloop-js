// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../tracer/utils';
import { type PromptQuery, type LoopMessage } from '../api';
import { type Message, type PromptVariables } from './types';

export function toPromptHubInput({ prompt_key, version, label }: PromptQuery) {
  return serializeTagValue({
    prompt_key,
    prompt_version: version,
    prompt_label: label,
  });
}

export function toPromptTemplateInput(
  messages?: LoopMessage[],
  variables?: PromptVariables,
) {
  return serializeTagValue({
    templates: messages,
    arguments: Object.entries(variables || {}).map(([key, value]) => ({
      key,
      source: 'input',
      value,
    })),
  });
}

export function toPromptTemplateOutput(messages: Message[]) {
  return serializeTagValue(messages);
}
