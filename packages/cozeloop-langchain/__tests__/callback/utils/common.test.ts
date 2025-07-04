// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  generateUUID,
  stringifyVal,
} from '@cozeloop/langchain/callbacks/utils';

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
    expect(stringifyVal([1, 2, 3])).toBe('[1,2,3]');
    expect(stringifyVal({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    expect(stringifyVal(undefined)).toBe('');
    expect(
      stringifyVal(() => {
        /** noop */
      }),
    ).toBe('function@');
  });
});
