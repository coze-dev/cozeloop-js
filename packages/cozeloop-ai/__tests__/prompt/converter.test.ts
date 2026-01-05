// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  toLoopToolCalls,
  toLoopPart,
  toLoopMessage,
  toLoopMessages,
  toVariableVal,
  toVariableVals,
} from '../../src/prompt/converter';
import {
  type ToolCall,
  type ContentPart,
  type Message,
  type PromptVariables,
} from '../../src/prompt';

describe('toLoopToolCalls', () => {
  it('should return undefined when input is undefined', () => {
    expect(toLoopToolCalls(undefined)).toBeUndefined();
  });

  it('should return an empty array when input is an empty array', () => {
    expect(toLoopToolCalls([])).toEqual([]);
  });

  it('should convert ToolCall array to LoopToolCall array', () => {
    const toolCalls: ToolCall[] = [
      {
        id: '1',
        type: 'function',
        function: { name: 'search', arguments: 'query=hello' },
      },
      {
        id: '2',
        type: 'function',
        function: { name: 'analyze', arguments: 'text=world' },
      },
    ];

    const expected = [
      {
        id: '1',
        type: 'function',
        function_call: { name: 'search', arguments: 'query=hello' },
      },
      {
        id: '2',
        type: 'function',
        function_call: { name: 'analyze', arguments: 'text=world' },
      },
    ];

    expect(toLoopToolCalls(toolCalls)).toEqual(expected);
  });
});

describe('toLoopPart', () => {
  it('should convert ContentPartText to LoopContentPart', () => {
    const contentPart: ContentPart = { type: 'text', text: 'hello' };
    const expected = { type: 'text', text: 'hello' };

    expect(toLoopPart(contentPart)).toEqual(expected);
  });

  it('should convert ContentPartImage to LoopContentPart', () => {
    const contentPart: ContentPart = {
      type: 'image_url',
      image_url: { url: 'https://example.com/image.jpg' },
    };
    const expected = {
      type: 'image_url',
      image_url: 'https://example.com/image.jpg',
    };

    expect(toLoopPart(contentPart)).toEqual(expected);
  });

  it('should throw an error for unsupported content type', () => {
    const contentPart: any = { type: 'unknown', data: 'invalid' };
    expect(() => toLoopPart(contentPart)).toThrowError(
      '[toLoopPart] unknown unsupported',
    );
  });
});

describe('toLoopMessage', () => {
  it('should convert system Message to LoopMessage', () => {
    const message: Message = { role: 'system', content: 'system message' };
    const expected = { role: 'system', content: 'system message' };

    expect(toLoopMessage(message)).toEqual(expected);
  });

  it('should convert user Message to LoopMessage', () => {
    const message: Message = {
      role: 'user',
      content: 'user message',
      parts: [{ type: 'text', text: 'hello' }],
    };
    const expected = {
      role: 'user',
      content: 'user message',
      parts: [{ type: 'text', text: 'hello' }],
    };

    expect(toLoopMessage(message)).toEqual(expected);
  });

  it('should convert tool Message to LoopMessage', () => {
    const message: Message = {
      role: 'tool',
      content: 'tool message',
      tool_call_id: '1',
    };
    const expected = {
      role: 'tool',
      content: 'tool message',
      tool_call_id: '1',
    };

    expect(toLoopMessage(message)).toEqual(expected);
  });

  it('should convert assistant Message to LoopMessage', () => {
    const message: Message = {
      role: 'assistant',
      content: 'assistant message',
      parts: [
        {
          type: 'image_url',
          image_url: { url: 'https://example.com/image.jpg' },
        },
      ],
      tool_calls: [
        {
          id: '1',
          type: 'function',
          function: { name: 'search', arguments: 'query=hello' },
        },
      ],
    };
    const expected = {
      role: 'assistant',
      content: 'assistant message',
      parts: [
        { type: 'image_url', image_url: 'https://example.com/image.jpg' },
      ],
      tool_calls: [
        {
          id: '1',
          type: 'function',
          function_call: { name: 'search', arguments: 'query=hello' },
        },
      ],
    };

    expect(toLoopMessage(message)).toEqual(expected);
  });

  it('should throw an error for unsupported role', () => {
    const message: any = { role: 'unknown', content: 'invalid message' };
    expect(() => toLoopMessage(message)).toThrowError(
      '[toLoopMessage] unknown unsupported',
    );
  });
});

describe('toLoopMessages', () => {
  it('should return an empty array when input is undefined or empty', () => {
    expect(toLoopMessages(undefined)).toEqual([]);
    expect(toLoopMessages([])).toEqual([]);
  });

  it('should convert Message array to LoopMessage array', () => {
    const messages: Message[] = [
      { role: 'system', content: 'system message' },
      {
        role: 'user',
        content: 'user message',
        parts: [{ type: 'text', text: 'hello' }],
      },
      { role: 'tool', content: 'tool message', tool_call_id: '1' },
    ];
    const expected = [
      { role: 'system', content: 'system message' },
      {
        role: 'user',
        content: 'user message',
        parts: [{ type: 'text', text: 'hello' }],
      },
      { role: 'tool', content: 'tool message', tool_call_id: '1' },
    ];

    expect(toLoopMessages(messages)).toEqual(expected);
  });
});

describe('toVariableVal', () => {
  it('should convert primitive value to VariableVal', () => {
    const key = 'stringValue';
    const value = 'hello';
    const expected = { key, value };

    expect(toVariableVal(key, value)).toEqual(expected);
  });

  it('should convert null to undefined', () => {
    const key = 'nullValue';
    const value = null;

    expect(toVariableVal(key, value)).toBeUndefined();
  });

  it('should convert Message to VariableVal', () => {
    const key = 'messageValue';
    const value: Message = { role: 'user', content: 'user message' };
    const expected = {
      key,
      placeholder_messages: [{ role: 'user', content: 'user message' }],
    };

    expect(toVariableVal(key, value)).toEqual(expected);
  });

  it('should convert Message array to VariableVal', () => {
    const key = 'messageArrayValue';
    const value: Message[] = [
      { role: 'system', content: 'system message' },
      { role: 'user', content: 'user message' },
    ];
    const expected = {
      key,
      placeholder_messages: [
        { role: 'system', content: 'system message' },
        { role: 'user', content: 'user message' },
      ],
    };

    expect(toVariableVal(key, value)).toEqual(expected);
  });

  it('should convert ContentPart array to VariableVal', () => {
    const key = 'contentPartArrayValue';
    const value: ContentPart[] = [
      { type: 'text', text: 'hello' },
      {
        type: 'image_url',
        image_url: { url: 'https://example.com/image.jpg' },
      },
    ];
    const expected = {
      key,
      multi_part_values: [
        { type: 'text', text: 'hello' },
        { type: 'image_url', image_url: 'https://example.com/image.jpg' },
      ],
    };

    expect(toVariableVal(key, value)).toEqual(expected);
  });

  it('should return undefined for unsupported value types', () => {
    const key = 'functionValue';
    const value = () => {
      /** no-op */
    };

    expect(toVariableVal(key, value)).toBeUndefined();
  });
});

describe('toVariableVals', () => {
  it('should return undefined when input is undefined', () => {
    expect(toVariableVals(undefined)).toBeUndefined();
  });

  it('should convert PromptVariables to VariableVal array', () => {
    const variables: PromptVariables = {
      stringValue: 'hello',
      numberValue: 42,
      booleanValue: true,
      messageValue: { role: 'user', content: 'user message' },
      messageArrayValue: [
        { role: 'system', content: 'system message' },
        { role: 'user', content: 'user message' },
      ],
      contentPartArrayValue: [
        { type: 'text', text: 'hello' },
        {
          type: 'image_url',
          image_url: { url: 'https://example.com/image.jpg' },
        },
      ],
      nullValue: null,
      undefinedValue: undefined,
      functionValue: () => {
        /** no-op */
      },
    };
    const expected = [
      { key: 'stringValue', value: 'hello' },
      { key: 'numberValue', value: '42' },
      { key: 'booleanValue', value: 'true' },
      {
        key: 'messageValue',
        placeholder_messages: [{ role: 'user', content: 'user message' }],
      },
      {
        key: 'messageArrayValue',
        placeholder_messages: [
          { role: 'system', content: 'system message' },
          { role: 'user', content: 'user message' },
        ],
      },
      {
        key: 'contentPartArrayValue',
        multi_part_values: [
          { type: 'text', text: 'hello' },
          { type: 'image_url', image_url: 'https://example.com/image.jpg' },
        ],
      },
    ];
    expect(toVariableVals(variables)).toEqual(expected);
  });
});
