import {
  AIMessage,
  HumanMessage,
  type MessageContentComplex,
} from '@langchain/core/messages';

import {
  parseRawMessage,
  parseBaseMessage,
  parseBaseMessages,
  parseLLMPrompts,
} from '@cozeloop/langchain/callbacks/utils/message';

describe('parseRawMessage', () => {
  it('🧪 should return undefined for undefined input', () => {
    expect(parseRawMessage(undefined)).toBeUndefined();
  });

  it('🧪 should return the input string for string input', () => {
    const inputString = 'Hello, world!';
    expect(parseRawMessage(inputString)).toBe(inputString);
  });

  it('🧪 should parse BaseMessage correctly', () => {
    const baseMessage = new HumanMessage('Hello, world!');
    const parsedMessage = parseRawMessage(baseMessage);
    expect(parsedMessage).toEqual({
      role: 'user',
      content: 'Hello, world!',
      parts: undefined,
      tool_calls: undefined,
    });
  });
});

describe('parseBaseMessage', () => {
  it('🧪 should parse BaseMessage correctly', () => {
    const complexContent: MessageContentComplex = {
      type: 'image_url',
      image_url: {
        name: 'image.jpg',
        url: 'https://example.com/image.jpg',
      },
    };
    const baseMessage = new AIMessage({ content: [complexContent] });
    const parsedMessage = parseBaseMessage(baseMessage);
    expect(parsedMessage).toEqual({
      role: 'assistant',
      content: undefined,
      parts: [
        {
          type: 'image_url',
          image_url: {
            name: 'image.jpg',
            url: 'https://example.com/image.jpg',
            detail: 'https://example.com/image.jpg',
          },
        },
      ],
      tool_calls: undefined,
    });
  });
});

describe('parseBaseMessages', () => {
  it('🧪 should return undefined on empty/undefined', () => {
    expect(parseBaseMessages()).toBeUndefined();
    expect(parseBaseMessages([])).toBeUndefined();
  });

  it('🧪 should parse an array of BaseMessage correctly', () => {
    const baseMessages = [
      new HumanMessage('Hello, world!'),
      new AIMessage('Hello, universe!'),
    ];
    const parsedMessages = parseBaseMessages([baseMessages]);
    expect(parsedMessages).toEqual([
      {
        role: 'user',
        content: 'Hello, world!',
        parts: undefined,
        tool_calls: undefined,
      },
      {
        role: 'assistant',
        content: 'Hello, universe!',
        parts: undefined,
        tool_calls: undefined,
      },
    ]);
  });

  it('🧪 should parse message parts correctly', () => {
    const parsed = parseBaseMessages([
      [
        new HumanMessage({
          content: [
            { type: 'text', text: '123' },
            {
              type: 'image',
              image_url: {
                name: 'img1',
                url: 'https://fake.cdn.com/img1.png',
              },
            },
            { type: 'image_url', image_url: 'https://fake.cdn.com/img2.png' },
          ],
        }),
        new HumanMessage({
          content: [
            { type: 'text', text: '123' },
            { type: 'file', file_url: 'https://fake.cdn.com/file1.pdf' },
            {
              type: 'file_url',
              file_url: {
                name: 'file2',
                url: 'https://fake.cdn.com/file2.pdf',
              },
            },
          ],
        }),
      ],
    ]);

    expect(parsed?.length).toBe(2);
    expect(parsed?.[0].parts).toMatchObject([
      { type: 'text', text: '123' },
      {
        type: 'image_url',
        image_url: { name: 'img1', url: 'https://fake.cdn.com/img1.png' },
      },
      {
        type: 'image_url',
        image_url: { url: 'https://fake.cdn.com/img2.png' },
      },
    ]);
    expect(parsed?.[1].parts).toMatchObject([
      { type: 'text', text: '123' },
      { type: 'file_url', file_url: { url: 'https://fake.cdn.com/file1.pdf' } },
      {
        type: 'file_url',
        file_url: { name: 'file2', url: 'https://fake.cdn.com/file2.pdf' },
      },
    ]);
  });

  it('🧪 should parse tool calls correctly', () => {
    const parsed = parseBaseMessages([
      [
        new AIMessage({
          content: '',
          tool_calls: [
            {
              id: 'tool-call-123',
              name: 'getWeather',
              args: { location: 'Shanghai' },
            },
          ],
        }),
        new AIMessage({ content: 'ai' }),
      ],
    ]);

    expect(parsed?.[0].tool_calls).toMatchObject([
      {
        id: 'tool-call-123',
        type: 'function',
        function: {
          name: 'getWeather',
          arguments: JSON.stringify({ location: 'Shanghai' }),
        },
      },
    ]);
    expect(parsed?.[1].tool_calls).toBeUndefined();
  });
});

describe('parseLLMPrompts', () => {
  it('🧪 should parse undefined or empty correctly', () => {
    expect(parseLLMPrompts()).toBeUndefined();
    expect(parseLLMPrompts([])).toBeUndefined();
  });

  it('🧪 should parse an array of strings correctly', () => {
    const prompts = ['Hello, world!', 'Hello, universe!'];
    expect(parseLLMPrompts(prompts)).toEqual(prompts);
  });

  it('🧪 should return the single string for an array with one element', () => {
    const prompt = 'Hello, world!';
    expect(parseLLMPrompts([prompt])).toBe(prompt);
  });
});
