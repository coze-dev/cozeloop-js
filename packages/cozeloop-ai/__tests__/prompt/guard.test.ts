// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  isContentPart,
  isContentPartArr,
  isMessage,
  isMessageArr,
} from '../../src/prompt/guard';

describe('isMessage', () => {
  it('should return true for valid message objects', () => {
    const validMessage = { role: 'user', content: 'Hello' };
    expect(isMessage(validMessage)).toBe(true);
  });

  it('should return false for non-object values', () => {
    expect(isMessage(null)).toBe(false);
    expect(isMessage(undefined)).toBe(false);
    expect(isMessage(123)).toBe(false);
    expect(isMessage('hello')).toBe(false);
  });

  it('should return false for objects with invalid role', () => {
    const invalidMessage = { role: 'invalid', content: 'Hello' };
    expect(isMessage(invalidMessage)).toBe(false);
  });
});

describe('isMessageArr', () => {
  it('should return true for an array of valid message objects', () => {
    const validMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];
    expect(isMessageArr(validMessages)).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(isMessageArr(null)).toBe(false);
    expect(isMessageArr(undefined)).toBe(false);
    expect(isMessageArr(123)).toBe(false);
    expect(isMessageArr('hello')).toBe(false);
  });

  it('should return false for an array containing invalid message objects', () => {
    const invalidMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'invalid', content: 'Hi there!' },
    ];
    expect(isMessageArr(invalidMessages)).toBe(false);
  });
});

describe('isContentPart', () => {
  it('should return true for valid text content parts', () => {
    const validTextPart = { type: 'text', text: 'Hello' };
    expect(isContentPart(validTextPart)).toBe(true);
  });

  it('should return true for valid image content parts', () => {
    const validImagePart = {
      type: 'image_url',
      image_url: { url: 'https://example.com/image.jpg' },
    };
    expect(isContentPart(validImagePart)).toBe(true);
  });

  it('should return false for non-object values', () => {
    expect(isContentPart(null)).toBe(false);
    expect(isContentPart(undefined)).toBe(false);
    expect(isContentPart(123)).toBe(false);
    expect(isContentPart('hello')).toBe(false);
  });

  it('should return false for objects without a valid type', () => {
    const invalidPart = { type: 'invalid', text: 'Hello' };
    expect(isContentPart(invalidPart)).toBe(false);
  });
});

describe('isContentPartArr', () => {
  it('should return true for an array of valid content parts', () => {
    const validParts = [
      { type: 'text', text: 'Hello' },
      {
        type: 'image_url',
        image_url: { url: 'https://example.com/image.jpg' },
      },
    ];
    expect(isContentPartArr(validParts)).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(isContentPartArr(null)).toBe(false);
    expect(isContentPartArr(undefined)).toBe(false);
    expect(isContentPartArr(123)).toBe(false);
    expect(isContentPartArr('hello')).toBe(false);
  });

  it('should return false for an array containing invalid content parts', () => {
    const invalidParts = [
      { type: 'text', text: 'Hello' },
      { type: 'invalid', text: 'Hi there!' },
    ];
    expect(isContentPartArr(invalidParts)).toBe(false);
  });
});
