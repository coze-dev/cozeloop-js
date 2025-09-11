// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../../src/tracer/utils';
import type { Message, PromptVariables } from '../../src/prompt/types';
import {
  toPromptHubInput,
  toPromptTemplateInput,
  toPromptTemplateOutput,
} from '../../src/prompt/trace';
import type { LoopMessage } from '../../src/api';

// Mock serializeTagValue to verify calls
vi.mock('../../src/tracer/utils', () => ({
  serializeTagValue: vi.fn(value => JSON.stringify(value)),
}));

const mockSerializeTagValue = vi.mocked(serializeTagValue);

describe('🧪 Prompt Trace Functions', () => {
  beforeEach(() => {
    mockSerializeTagValue.mockClear();
  });

  describe('toPromptHubInput', () => {
    it('should return correct serialized value for prompt_key only', () => {
      const input = { prompt_key: 'test_key' };
      const expected = '{"prompt_key":"test_key"}';
      expect(toPromptHubInput(input)).toBe(expected);
    });

    it('should return correct serialized value for prompt_key and version', () => {
      const input = { prompt_key: 'test_key', version: 'v1' };
      const expected = '{"prompt_key":"test_key","prompt_version":"v1"}';
      expect(toPromptHubInput(input)).toBe(expected);
    });

    it('should return correct serialized value for prompt_key and label', () => {
      const input = { prompt_key: 'test_key', label: 'test_label' };
      const expected = '{"prompt_key":"test_key","prompt_label":"test_label"}';
      expect(toPromptHubInput(input)).toBe(expected);
    });

    it('should return correct serialized value for prompt_key, version and label', () => {
      const input = {
        prompt_key: 'test_key',
        version: 'v1',
        label: 'test_label',
      };
      const expected =
        '{"prompt_key":"test_key","prompt_version":"v1","prompt_label":"test_label"}';
      expect(toPromptHubInput(input)).toBe(expected);
    });
  });

  describe('toPromptTemplateInput', () => {
    it('should serialize template input with messages and variable map', () => {
      const messages: LoopMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant',
        },
        {
          role: 'user',
          content: 'Hello {{name}}',
          parts: [
            { type: 'text', text: 'Hello ' },
            { type: 'multi_part_variable', text: 'name' },
          ],
        },
      ];

      const variableMap: PromptVariables = {
        name: 'World',
        age: 25,
      };

      const result = toPromptTemplateInput(messages, variableMap);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: messages,
        arguments: [
          { key: 'name', source: 'input', value: 'World' },
          { key: 'age', source: 'input', value: 25 },
        ],
      });
      expect(result).toContain('templates');
      expect(result).toContain('arguments');
    });

    it('should handle empty messages and variable map', () => {
      const messages: LoopMessage[] = [];
      const variableMap: PromptVariables = {};

      const result = toPromptTemplateInput(messages, variableMap);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: [],
        arguments: [],
      });
      expect(result).toBe('{"templates":[],"arguments":[]}');
    });

    it('should handle only messages without variable map', () => {
      const messages: LoopMessage[] = [
        {
          role: 'user',
          content: 'Hello',
        },
      ];

      const result = toPromptTemplateInput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: messages,
        arguments: [],
      });
      expect(result).toContain('templates');
      expect(result).toContain('arguments');
    });

    it('should handle only variable map without messages', () => {
      const variableMap: PromptVariables = {
        test: 'value',
      };

      const result = toPromptTemplateInput(undefined, variableMap);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: undefined,
        arguments: [{ key: 'test', source: 'input', value: 'value' }],
      });
      expect(result).toContain('arguments');
    });

    it('should handle both parameters as undefined', () => {
      const result = toPromptTemplateInput();

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: undefined,
        arguments: [],
      });
      expect(result).toBe('{"arguments":[]}');
    });

    it('should handle variable map with undefined values', () => {
      const variableMap: PromptVariables = {
        defined: 'test',
        undefined_value: undefined,
      };

      const result = toPromptTemplateInput([], variableMap);

      expect(result).toBe(
        '{"templates":[],"arguments":[{"key":"defined","source":"input","value":"test"},{"key":"undefined_value","source":"input"}]}',
      );
      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: [],
        arguments: [
          { key: 'defined', source: 'input', value: 'test' },
          { key: 'undefined_value', source: 'input', value: undefined },
        ],
      });
    });

    it('should handle variable map with different value types', () => {
      const variableMap: PromptVariables = {
        string_var: 'text',
        number_var: 42,
        boolean_var: true,
        object_var: { role: 'user', content: 'test' },
      };

      const result = toPromptTemplateInput([], variableMap);

      expect(result).toBe(
        '{"templates":[],"arguments":[{"key":"string_var","source":"input","value":"text"},{"key":"number_var","source":"input","value":42},{"key":"boolean_var","source":"input","value":true},{"key":"object_var","source":"input","value":{"role":"user","content":"test"}}]}',
      );
      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: [],
        arguments: [
          { key: 'string_var', source: 'input', value: 'text' },
          { key: 'number_var', source: 'input', value: 42 },
          { key: 'boolean_var', source: 'input', value: true },
          {
            key: 'object_var',
            source: 'input',
            value: { role: 'user', content: 'test' },
          },
        ],
      });
    });
  });

  describe('toPromptTemplateOutput', () => {
    it('should serialize message array directly', () => {
      const messages: Message[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant',
        },
        {
          role: 'user',
          content: 'Hello World',
        },
        {
          role: 'assistant',
          content: 'Hi there! How can I help you today?',
        },
      ];

      const result = toPromptTemplateOutput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith(messages);
      expect(result).toBe(JSON.stringify(messages));
    });

    it('should handle empty message array', () => {
      const messages: Message[] = [];

      const result = toPromptTemplateOutput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith([]);
      expect(result).toBe('[]');
    });

    it('should handle messages with different roles', () => {
      const messages: Message[] = [
        { role: 'system', content: 'System message' },
        { role: 'user', content: 'User message' },
        { role: 'assistant', content: 'Assistant message' },
      ];

      const result = toPromptTemplateOutput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith(messages);
      expect(result).toBe(JSON.stringify(messages));
    });

    it('should handle messages with parts field', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: 'Check this image',
          parts: [
            { type: 'text', text: 'Check this image' },
            {
              type: 'image_url',
              image_url: {
                url: 'https://example.com/image.jpg',
                detail: 'high',
              },
            },
          ],
        },
      ];

      const result = toPromptTemplateOutput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith(messages);
      expect(result).toBe(JSON.stringify(messages));
    });

    it('should handle messages with special characters in content', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: 'Special chars: "quotes", \\backslash, \n newline, \t tab',
        },
      ];

      const result = toPromptTemplateOutput(messages);

      expect(mockSerializeTagValue).toHaveBeenCalledWith(messages);
      expect(result).toBe(JSON.stringify(messages));
    });
  });
});
