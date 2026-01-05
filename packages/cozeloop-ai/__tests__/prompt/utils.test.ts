// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  cacheKeyToQuery,
  formatPromptTemplate,
  queryToCacheKey,
} from '../../src/prompt/utils';
import type { PromptVariables, PromptTemplate, PromptQuery } from '../../src';

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

    it('should handle jinja2 template', () => {
      const promptTemplate: PromptTemplate = {
        messages: [
          { role: 'system', content: 'You are {{ user.name }}.' },
          { role: 'placeholder', content: 'conversation' },
        ],
        template_type: 'jinja2',
        variable_defs: [{ key: 'conversation', type: 'placeholder' }],
      };

      const variables: PromptVariables = {
        user: { name: 'Bot' },
      };
      const result = formatPromptTemplate(promptTemplate, variables);
      expect(result).toEqual([{ role: 'system', content: 'You are Bot.' }]);
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
    it('should create a cache key with prompt_key, version, and label', () => {
      const query: PromptQuery = {
        prompt_key: 'test_prompt',
        version: '1.0',
        label: 'production',
      };
      const cacheKey = queryToCacheKey(query);
      expect(cacheKey).toBe('test_prompt|1.0|production');
    });

    it('should handle undefined version and label', () => {
      const query: PromptQuery = {
        prompt_key: 'test_prompt',
      };
      const cacheKey = queryToCacheKey(query);
      expect(cacheKey).toBe('test_prompt|-|-');
    });
  });

  describe('🧪 cacheKeyToQuery', () => {
    it('should convert a cache key to a PromptQuery object', () => {
      const cacheKey = 'test_prompt|1.0|production';
      const query = cacheKeyToQuery(cacheKey);
      expect(query).toEqual({
        prompt_key: 'test_prompt',
        version: '1.0',
        label: 'production',
      });
    });

    it('should handle undefined version and label', () => {
      const cacheKey = 'test_prompt|-|-';
      const query = cacheKeyToQuery(cacheKey);
      expect(query).toEqual({
        prompt_key: 'test_prompt',
        version: undefined,
        label: undefined,
      });
    });
  });
});
