// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  safeJsonParse,
  filterMessageBody,
  ZERO_WIDTH_CHAR,
} from '../src/lark/utils';

describe('safeJsonParse', () => {
  it('🧪 should parse valid JSON string', () => {
    const validJson = '{"name": "John", "age": 30}';
    const result = safeJsonParse<{ name: string; age: number }>(validJson);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('🧪 should return undefined for invalid JSON string', () => {
    const invalidJson = 'invalid json';
    const result = safeJsonParse(invalidJson);
    expect(result).toBeUndefined();
  });

  it('🧪 should handle empty string', () => {
    const emptyString = '';
    const result = safeJsonParse(emptyString);
    expect(result).toBeUndefined();
  });

  it('🧪 should handle null input', () => {
    const nullInput = null as unknown as string;
    const result = safeJsonParse(nullInput);
    expect(result).toBeUndefined();
  });
});

describe('filterMessageBody', () => {
  it('🧪 should return "-" when input is undefined or empty', () => {
    expect(filterMessageBody(undefined)).toBe('-');
    expect(filterMessageBody('')).toBe('-');
  });

  it('🧪 should obfuscate emails', () => {
    const input = 'Hello, my email is test@example.com';
    console.info(filterMessageBody(input));
    const expected = `Hello, my email is test@${ZERO_WIDTH_CHAR}example.com`;
    expect(filterMessageBody(input)).toBe(expected);
  });

  it('🧪 should obfuscate numbers longer than 4 digits', () => {
    const input = 'My phone number is 1 12 123 1234567890';
    const expected = `My phone number is 1 12 123 1234567890${ZERO_WIDTH_CHAR}`;
    expect(filterMessageBody(input)).toBe(expected);
  });

  it('🧪 should obfuscate emails and numbers', () => {
    const input = 'Contact me at test@example.com or 1234567890';
    const expected = `Contact me at test@${ZERO_WIDTH_CHAR}example.com or 1234567890${ZERO_WIDTH_CHAR}`;
    expect(filterMessageBody(input)).toBe(expected);
  });
});
