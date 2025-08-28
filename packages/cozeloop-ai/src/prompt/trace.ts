// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../tracer/utils';
import { type TemplateMessage } from '../api';
import { type Message, type PromptVariables } from './types';

export function toPromptHubInput(key: string, version?: string) {
  return serializeTagValue({
    prompt_key: key,
    prompt_version: version,
  });
}

export function toPromptTemplateInput(
  messages?: TemplateMessage[],
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
