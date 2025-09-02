// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../../src/tracer/utils';
import type { Message, PromptVariables } from '../../src/prompt/types';
import {
  toPromptHubInput,
  toPromptTemplateInput,
  toPromptTemplateOutput,
} from '../../src/prompt/trace';
import type { TemplateMessage } from '../../src/api';

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
    it('should serialize prompt hub input with key and version', () => {
      const key = 'test-prompt';
      const version = '1.0.0';

      const result = toPromptHubInput(key, version);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        prompt_key: key,
        prompt_version: version,
      });
      expect(result).toBe(
        '{"prompt_key":"test-prompt","prompt_version":"1.0.0"}',
      );
    });

    it('should serialize prompt hub input with key but without version', () => {
      const key = 'test-prompt';

      const result = toPromptHubInput(key);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        prompt_key: key,
        prompt_version: undefined,
      });
      expect(result).toBe('{"prompt_key":"test-prompt"}');
    });

    it('should handle empty string key', () => {
      const key = '';
      const version = '1.0.0';

      const result = toPromptHubInput(key, version);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        prompt_key: '',
        prompt_version: version,
      });
      expect(result).toBe('{"prompt_key":"","prompt_version":"1.0.0"}');
    });

    it('should handle empty string version', () => {
      const key = 'test-prompt';
      const version = '';

      const result = toPromptHubInput(key, version);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        prompt_key: key,
        prompt_version: '',
      });
      expect(result).toBe('{"prompt_key":"test-prompt","prompt_version":""}');
    });

    it('should handle special characters in key', () => {
      const key = 'test@prompt with spaces';
      const version = 'v1.0.0-beta';

      const result = toPromptHubInput(key, version);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        prompt_key: key,
        prompt_version: version,
      });
      expect(result).toBe(
        '{"prompt_key":"test@prompt with spaces","prompt_version":"v1.0.0-beta"}',
      );
    });
  });

  describe('toPromptTemplateInput', () => {
    it('should serialize template input with messages and variable map', () => {
      const messages: TemplateMessage[] = [
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
      const messages: TemplateMessage[] = [];
      const variableMap: PromptVariables = {};

      const result = toPromptTemplateInput(messages, variableMap);

      expect(mockSerializeTagValue).toHaveBeenCalledWith({
        templates: [],
        arguments: [],
      });
      expect(result).toBe('{"templates":[],"arguments":[]}');
    });

    it('should handle only messages without variable map', () => {
      const messages: TemplateMessage[] = [
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

  describe('Integration tests', () => {
    it('should call serializeTagValue exactly once for each function', () => {
      // Test toPromptHubInput
      toPromptHubInput('test');
      expect(mockSerializeTagValue).toHaveBeenCalledTimes(1);

      mockSerializeTagValue.mockClear();

      // Test toPromptTemplateInput
      toPromptTemplateInput();
      expect(mockSerializeTagValue).toHaveBeenCalledTimes(1);

      mockSerializeTagValue.mockClear();

      // Test toPromptTemplateOutput
      toPromptTemplateOutput([]);
      expect(mockSerializeTagValue).toHaveBeenCalledTimes(1);
    });

    it('should work with realistic data structures', () => {
      const templateMessages: TemplateMessage[] = [
        {
          role: 'system',
          content: 'You are {{assistant_type}}',
          parts: [
            { type: 'text', text: 'You are ' },
            { type: 'multi_part_variable', text: 'assistant_type' },
          ],
        },
      ];

      const variableMap: PromptVariables = {
        assistant_type: 'a helpful AI assistant',
      };

      const outputMessages: Message[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant',
        },
      ];

      // Test all functions with realistic data
      const hubResult = toPromptHubInput('chat-assistant', 'v2.1.0');
      const templateResult = toPromptTemplateInput(
        templateMessages,
        variableMap,
      );
      const outputResult = toPromptTemplateOutput(outputMessages);

      expect(hubResult).toContain('chat-assistant');
      expect(templateResult).toContain('assistant_type');
      expect(outputResult).toContain('helpful AI assistant');
      expect(mockSerializeTagValue).toHaveBeenCalledTimes(3);
    });
  });
});
