// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../../src/tracer/utils';
import {
  COZELOOP_TRACE_BASIC_TAGS,
  COZELOOP_TRACE_BUSINESS_TAGS,
} from '../../src/tracer';
import type { Message, PromptVariables } from '../../src/prompt/types';
import {
  toPromptHubInput,
  toPromptTemplateInput,
  toPromptTemplateOutput,
  toPtaaSModelName,
  toPtaaSReqTags,
  toModelOutput,
  toPtaasRespTags,
} from '../../src/prompt/trace';
import type {
  LoopMessage,
  ExecutePromptReq,
  ExecutePromptReply,
} from '../../src/api';

// Mock serializeTagValue to verify calls
vi.mock('../../src/tracer/utils', () => ({
  serializeTagValue: vi.fn(value => JSON.stringify(value)),
}));

const mockSerializeTagValue = vi.mocked(serializeTagValue);

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

describe('toPtaaSModelName', () => {
  it('should return undefined when prompt_identifier is not provided', () => {
    const req: ExecutePromptReq = {
      messages: [],
    };

    const result = toPtaaSModelName(req);

    expect(result).toBeUndefined();
  });

  it('should return prompt_key when only prompt_key is provided', () => {
    const req: ExecutePromptReq = {
      messages: [],
      prompt_identifier: {
        prompt_key: 'test_prompt',
      },
    };

    const result = toPtaaSModelName(req);

    expect(result).toBe('test_prompt');
  });

  it('should return prompt_key@version when version is provided', () => {
    const req: ExecutePromptReq = {
      messages: [],
      prompt_identifier: {
        prompt_key: 'test_prompt',
        version: 'v1.0.0',
      },
    };

    const result = toPtaaSModelName(req);

    expect(result).toBe('test_prompt@v1.0.0');
  });

  it('should return prompt_key|label when only label is provided', () => {
    const req: ExecutePromptReq = {
      messages: [],
      prompt_identifier: {
        prompt_key: 'test_prompt',
        label: 'production',
      },
    };

    const result = toPtaaSModelName(req);

    expect(result).toBe('test_prompt|production');
  });

  it('should prioritize version over label when both are provided', () => {
    const req: ExecutePromptReq = {
      messages: [],
      prompt_identifier: {
        prompt_key: 'test_prompt',
        version: 'v2.0.0',
        label: 'production',
      },
    };

    const result = toPtaaSModelName(req);

    expect(result).toBe('test_prompt@v2.0.0');
  });
});

describe('toPtaaSReqTags', () => {
  it('should return correct tags without stream', () => {
    const req: ExecutePromptReq = {
      messages: [{ role: 'user', content: 'Hello' }],
      prompt_identifier: {
        prompt_key: 'test_prompt',
        version: 'v1',
      },
    };

    const result = toPtaaSReqTags(req);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT]: JSON.stringify(req),
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_PROVIDER]: 'Cozeloop PtaaS',
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_NAME]: 'test_prompt@v1',
      [COZELOOP_TRACE_BUSINESS_TAGS.STREAM]: false,
    });
    expect(mockSerializeTagValue).toHaveBeenCalledWith(req);
  });

  it('should return correct tags with stream=true', () => {
    const req: ExecutePromptReq = {
      messages: [{ role: 'user', content: 'Hello' }],
      prompt_identifier: {
        prompt_key: 'test_prompt',
      },
    };

    const result = toPtaaSReqTags(req, true);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT]: JSON.stringify(req),
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_PROVIDER]: 'Cozeloop PtaaS',
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_NAME]: 'test_prompt',
      [COZELOOP_TRACE_BUSINESS_TAGS.STREAM]: true,
    });
  });

  it('should handle request without prompt_identifier', () => {
    const req: ExecutePromptReq = {
      messages: [{ role: 'user', content: 'Hello' }],
    };

    const result = toPtaaSReqTags(req);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT]: JSON.stringify(req),
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_PROVIDER]: 'Cozeloop PtaaS',
      [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_NAME]: undefined,
      [COZELOOP_TRACE_BUSINESS_TAGS.STREAM]: false,
    });
  });
});

describe('toModelOutput', () => {
  it('should return undefined when reply is not provided', () => {
    const result = toModelOutput();

    expect(result).toBeUndefined();
  });

  it('should return undefined when reply message is not provided', () => {
    const reply = {
      finish_reason: 'stop',
    } as unknown as ExecutePromptReply;

    const result = toModelOutput(reply);

    expect(result).toBeUndefined();
  });

  it('should serialize basic message correctly', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello, how can I help you?',
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    const result = toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Hello, how can I help you?',
            reasoning_content: undefined,
            parts: undefined,
            tool_call_id: undefined,
            tool_calls: undefined,
          },
        },
      ],
    });
    expect(result).toBeTruthy();
  });

  it('should handle message with reasoning_content', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Answer',
        reasoning_content: 'Thinking process...',
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Answer',
            reasoning_content: 'Thinking process...',
            parts: undefined,
            tool_call_id: undefined,
            tool_calls: undefined,
          },
        },
      ],
    });
  });

  it('should handle message with parts', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Check this image',
        parts: [
          { type: 'text', text: 'Check this image' },
          {
            type: 'image_url',
            image_url: 'https://example.com/image.jpg',
          },
        ],
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Check this image',
            reasoning_content: undefined,
            parts: [
              { type: 'text', text: 'Check this image' },
              {
                type: 'image_url',
                image_url: 'https://example.com/image.jpg',
              },
            ],
            tool_call_id: undefined,
            tool_calls: undefined,
          },
        },
      ],
    });
  });

  it('should handle message with tool_calls', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'tool_calls',
      message: {
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            id: 'call_123',
            function_call: {
              name: 'get_weather',
              arguments: '{"city":"Beijing"}',
            },
          },
        ],
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'tool_calls',
          message: {
            role: 'assistant',
            content: '',
            reasoning_content: undefined,
            parts: undefined,
            tool_call_id: undefined,
            tool_calls: [
              {
                id: 'call_123',
                type: 'function',
                function: {
                  name: 'get_weather',
                  arguments: '{"city":"Beijing"}',
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('should handle message with tool_call_id (tool response)', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'tool',
        content: '{"temperature": 25}',
        tool_call_id: 'call_123',
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'tool',
            content: '{"temperature": 25}',
            reasoning_content: undefined,
            parts: undefined,
            tool_call_id: 'call_123',
            tool_calls: undefined,
          },
        },
      ],
    });
  });

  it('should filter out empty parts array', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello',
        parts: [],
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Hello',
            reasoning_content: undefined,
            parts: undefined,
            tool_call_id: undefined,
            tool_calls: undefined,
          },
        },
      ],
    });
  });

  it('should filter out empty tool_calls array', () => {
    const reply: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello',
        tool_calls: [],
      },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    toModelOutput(reply);

    expect(mockSerializeTagValue).toHaveBeenCalledWith({
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Hello',
            reasoning_content: undefined,
            parts: undefined,
            tool_call_id: undefined,
            tool_calls: undefined,
          },
        },
      ],
    });
  });
});

describe('toPtaasRespTags', () => {
  it('should return correct tags with complete response', () => {
    const resp: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello!',
      },
      usage: {
        input_tokens: 10,
        output_tokens: 5,
      },
    };

    const result = toPtaasRespTags(resp);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT]: expect.any(String),
      [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: 10,
      [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: 5,
    });
  });

  it('should handle response without usage', () => {
    const resp = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello!',
      },
    } as unknown as ExecutePromptReply;

    const result = toPtaasRespTags(resp);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT]: expect.any(String),
      [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: undefined,
      [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: undefined,
    });
  });

  it('should handle undefined response', () => {
    const result = toPtaasRespTags(undefined);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT]: undefined,
      [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: undefined,
      [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: undefined,
    });
  });

  it('should handle partial usage information', () => {
    const resp: ExecutePromptReply = {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello!',
      },
      usage: {
        input_tokens: 10,
      } as any,
    };

    const result = toPtaasRespTags(resp);

    expect(result).toEqual({
      [COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT]: expect.any(String),
      [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: 10,
      [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: undefined,
    });
  });
});
