// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  toLoopTraceSpanPromptTemplateInput,
  toLoopTraceSpanPromptTemplateMessages,
} from '../../src/tracer/utils/adapt';
import { type PromptVariables } from '../../src/prompt';
import { type Message } from '../../src/api/prompt';

describe('loop', () => {
  describe('toLoopTraceSpanPromptTemplateInput', () => {
    it('should return correct LoopTracePromptTemplateInput with messages and variables', () => {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      const variables: PromptVariables = { name: 'John', age: 30 };

      const result = toLoopTraceSpanPromptTemplateInput(messages, variables);

      expect(result).toEqual({
        templates: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        arguments: [
          { key: 'name', value: 'John' },
          { key: 'age', value: 30 },
        ],
      });
    });

    it('should return correct LoopTracePromptTemplateInput with no messages and no variables', () => {
      const result = toLoopTraceSpanPromptTemplateInput();

      expect(result).toEqual({
        templates: undefined,
        arguments: [],
      });
    });
  });

  describe('toLoopTraceSpanPromptTemplateMessages', () => {
    it('should return correct LoopTraceLLMCallMessage[] with messages', () => {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const result = toLoopTraceSpanPromptTemplateMessages(messages);

      expect(result).toEqual([
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ]);
    });

    it('should return undefined with no messages', () => {
      const result = toLoopTraceSpanPromptTemplateMessages();

      expect(result).toBeUndefined();
    });
  });
});
