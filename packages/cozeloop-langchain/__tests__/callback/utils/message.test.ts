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
});

describe('parseLLMPrompts', () => {
  it('🧪 should parse an array of strings correctly', () => {
    const prompts = ['Hello, world!', 'Hello, universe!'];
    expect(parseLLMPrompts(prompts)).toEqual(prompts);
  });

  it('🧪 should return the single string for an array with one element', () => {
    const prompt = 'Hello, world!';
    expect(parseLLMPrompts([prompt])).toBe(prompt);
  });
});
