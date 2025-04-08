// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  cacheKeyToQuery,
  formatPromptTemplate,
  queryToCacheKey,
} from '../../src/prompt/utils';
import type { PromptVariables, PromptTemplate } from '../../src';

describe('Test prompt/utils', () => {
  describe('🧪 formatPromptTemplate', () => {
    it('should return an empty array when promptTemplate is undefined', () => {
      const result = formatPromptTemplate(undefined);
      expect(result).toEqual([]);
    });

    it('should return an empty array when promptTemplate has no messages', () => {
      const promptTemplate: PromptTemplate = {
        messages: [],
        template_type: 'normal',
        variable_defs: [],
      };
      const result = formatPromptTemplate(promptTemplate);
      expect(result).toEqual([]);
    });

    it('should format messages without variables', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' },
        ],
        template_type: 'normal',
        variable_defs: [],
      };
      const result = formatPromptTemplate(promptTemplate);
      expect(result).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' },
      ]);
    });

    it('should interpolate variables in messages', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          { role: 'system', content: 'You are a {{role}}.' },
          { role: 'user', content: 'My name is {{name}}.' },
        ],
        template_type: 'normal',
        variable_defs: [
          { key: 'role', type: 'string' },
          { key: 'name', type: 'string' },
        ],
      };
      const variables: PromptVariables = {
        role: 'helpful assistant',
        name: 'Alice',
      };
      const result = formatPromptTemplate(promptTemplate, variables);
      expect(result).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'My name is Alice.' },
      ]);
    });

    it('should not interpolate variables of non-string type', () => {
      const promptTemplate: PromptTemplate = {
        messages: [{ role: 'user', content: 'The answer is {{answer}}.' }],
        template_type: 'normal',
        // @ts-expect-error skip
        variable_defs: [{ key: 'answer', type: 'number' }],
      };
      const variables: PromptVariables = {
        answer: 42,
      };
      const result = formatPromptTemplate(promptTemplate, variables);
      expect(result).toEqual([
        { role: 'user', content: 'The answer is {{answer}}.' },
      ]);
    });

    it('should handle placeholder messages', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'placeholder', content: 'conversation' },
        ],
        template_type: 'normal',
        variable_defs: [{ key: 'conversation', type: 'placeholder' }],
      };
      const variables: PromptVariables = {
        conversation: [
          { role: 'user', content: 'Hello!' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      };
      const result = formatPromptTemplate(promptTemplate, variables);
      expect(result).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi there!' },
      ]);
    });

    it('should handle empty placeholder', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'placeholder', content: 'conversation' },
        ],
        template_type: 'normal',
        variable_defs: [{ key: 'conversation', type: 'placeholder' }],
      };
      const variables: PromptVariables = {
        conversation: [],
      };
      const result = formatPromptTemplate(promptTemplate, variables);
      expect(result).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
      ]);
    });

    it('should throw error for unsupported message role', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          {
            role: 'unsupported' as any,
            content: 'This should throw an error.',
          },
        ],
        template_type: 'normal',
        variable_defs: [],
      };
      expect(() => formatPromptTemplate(promptTemplate)).toThrow(
        '[formatMessage] unsupported message role unsupported',
      );
    });
  });
  describe('🧪 queryToCacheKey', () => {
    it('should return the key when version is not provided', () => {
      const result = queryToCacheKey('test-key');
      expect(result).toBe('test-key');
    });

    it('should return key@version when version is provided', () => {
      const result = queryToCacheKey('test-key', '1.0.0');
      expect(result).toBe('test-key@1.0.0');
    });

    it('should handle empty strings', () => {
      const result = queryToCacheKey('');
      expect(result).toBe('');
    });

    it('should handle empty version', () => {
      const result = queryToCacheKey('test-key', '');
      expect(result).toBe('test-key');
    });
  });

  describe('🧪 cacheKeyToQuery', () => {
    it('should return correct PromptQuery when version is provided', () => {
      const result = cacheKeyToQuery('test-key@1.0.0');
      expect(result).toEqual({ prompt_key: 'test-key', version: '1.0.0' });
    });

    it('should return correct PromptQuery when version is not provided', () => {
      const result = cacheKeyToQuery('test-key');
      expect(result).toEqual({ prompt_key: 'test-key', version: undefined });
    });

    it('should handle empty string', () => {
      const result = cacheKeyToQuery('');
      expect(result).toEqual({ prompt_key: '', version: undefined });
    });

    it('should handle multiple @ symbols', () => {
      const result = cacheKeyToQuery('test@key@1.0.0');
      expect(result).toEqual({ prompt_key: 'test@key', version: '1.0.0' });
    });
  });
});
