import { type Serialized } from '@langchain/core/dist/load/serializable';

import {
  generateUUID,
  stringifyVal,
  guessModelProvider,
  extractLLMAttributes,
} from '../src/callbacks/utils';

describe('generateUUID', () => {
  it('🧪 should generate a valid UUID string', () => {
    const uuid = generateUUID();
    const pattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(pattern.test(uuid)).toBe(true);
  });
});

describe('stringifyVal', () => {
  it('🧪 should stringify different types of values correctly', () => {
    expect(stringifyVal(42)).toBe('42');
    expect(stringifyVal(3.14)).toBe('3.14');
    expect(stringifyVal(true)).toBe('true');
    expect(stringifyVal(false)).toBe('false');
    expect(stringifyVal('hello')).toBe('hello');
    expect(stringifyVal(Symbol('foo'))).toBe('Symbol(foo)');
    expect(stringifyVal(null)).toBe('');
    expect(stringifyVal(new Date('2023-04-01'))).toBe(
      '2023-04-01T00:00:00.000Z',
    );
    expect(stringifyVal(new Error('Something went wrong'))).toBe(
      'Something went wrong',
    );
    expect(stringifyVal([1, 2, 3])).toBe('1,2,3');
    expect(stringifyVal({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    expect(stringifyVal(undefined)).toBe('');
    expect(
      stringifyVal(() => {
        /** noop */
      }),
    ).toBe('function@');
  });
});

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
