// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type Serialized } from '@langchain/core/load/serializable';

import {
  guessModelProvider,
  extractLLMAttributes,
} from '@cozeloop/langchain/callbacks/utils';

describe('guessModelProvider', () => {
  it('🧪 should guess the model provider correctly', () => {
    expect(guessModelProvider('gpt-3.5-turbo')).toBe('Open AI');
    expect(guessModelProvider('claude-v1')).toBe('Anthropic');
    expect(guessModelProvider('gemini-1.0')).toBe('Gemini');
    expect(guessModelProvider('doubao-large')).toBe('Doubao');
    expect(guessModelProvider('grok-001')).toBe('Grok');
    expect(guessModelProvider('deepseek-1')).toBe('DeepSeek');
    expect(guessModelProvider('qwen-3b')).toBe('Qwen');
    expect(guessModelProvider('moonshot-xx')).toBe('MoonShot');
    expect(guessModelProvider('ernie-3.0')).toBe('Ernie');
    expect(guessModelProvider('minimax-12b')).toBe('Minimax');
    expect(guessModelProvider('unknown-model')).toBe('unknown-model');
  });
});

describe('extractLLMAttributes', () => {
  it('🧪 should extract LLM attributes correctly', () => {
    const llm: Serialized = {
      lc: 1,
      type: 'constructor',
      id: ['some', 'model', 'gpt-4o'],
      kwargs: {},
    };
    const extraParams = {
      invocation_params: {
        top_p: 0.9,
        top_k: 40,
        temperature: 0.7,
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
        max_tokens: 1000,
      },
    };
    const metadata = {
      model: 'gpt-3.5-turbo',
    };

    const attributes = extractLLMAttributes(llm, extraParams, metadata);

    expect(attributes.model_name).toBe('gpt-4o');
    expect(attributes.model_provider).toBe('Open AI');
    expect(attributes.top_p).toBe(0.9);
    expect(attributes.top_k).toBe(40);
    expect(attributes.temperature).toBe(0.7);
    expect(attributes.frequency_penalty).toBe(0.1);
    expect(attributes.presence_penalty).toBe(0.2);
    expect(attributes.max_tokens).toBe(1000);
  });
});
