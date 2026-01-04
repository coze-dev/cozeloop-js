// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import nodeFetch from 'node-fetch';

import {
  getNodeStreamAdapter,
  isAxiosStatic,
  parseEventChunk,
  generateChunks,
} from '../../src/api/api-client/utils';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

describe('getNodeStreamAdapter', () => {
  it('should return undefined if streaming is false', () => {
    const adapter = getNodeStreamAdapter(false);
    expect(adapter).toBeUndefined();
  });

  it('should return "fetch" if window.fetch is available', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const adapter = getNodeStreamAdapter(true);
    const mockResponse = { data: { val: 1 } };
    (fetch as any).mockResolvedValueOnce(mockResponse);
    expect(adapter).toBe('fetch');
    // @ts-expect-error skip
    const result = await fetch({
      url: 'https://example.com/api',
      method: 'post',
    });
    expect(result).toBe(mockResponse);
    vi.unstubAllGlobals();
  });

  it('should return a function for node-fetch', async () => {
    vi.stubGlobal('fetch', undefined);
    const mockResponse = {
      status: 200,
      body: 'Hello, World!',
      headers: new Map<string, string>(),
    };
    (nodeFetch as any).mockResolvedValueOnce(mockResponse);

    const adapter = getNodeStreamAdapter(true);
    expect(typeof adapter).toBe('function');

    // @ts-expect-error skip
    const response = await adapter({
      url: 'https://example.com/api',
    });

    expect(nodeFetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.anything(),
    );
    expect(response).toEqual({
      data: 'Hello, World!',
      status: 200,
      statusText: undefined,
      headers: {},
      config: { url: 'https://example.com/api' },
      request: { method: 'GET', headers: {}, timeout: undefined },
    });
    vi.unstubAllGlobals();
  });
});

describe('isAxiosStatic', () => {
  it('should return true if the instance has Axios property', () => {
    const instance = { Axios: true };
    expect(isAxiosStatic(instance)).toBe(true);
  });

  it('should return false if the instance does not have Axios property', () => {
    const instance = {};
    expect(isAxiosStatic(instance)).toBe(false);
  });
});

describe('parseEventChunk', () => {
  it('should parse the event and data from the chunk', () => {
    const chunk = 'event: my-event\ndata: {"foo":"bar"}';
    const result = parseEventChunk(chunk);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should throw an error if the event is "gateway-error"', () => {
    const chunk = 'event: gateway-error\ndata: Something went wrong';
    expect(() => parseEventChunk(chunk)).toThrow('Something went wrong');
  });
});

describe('generateChunks', () => {
  it('should yield an empty object if stream is undefined or null', async () => {
    const parseChunk = vi.fn();
    const generator = generateChunks(undefined, parseChunk);
    const result = await generator.next();

    expect(result.value).toBeUndefined();
    expect(parseChunk).toHaveBeenCalledWith('');
  });

  it('should parse chunks from a readable stream', async () => {
    const parseChunk = vi.fn(chunk => chunk);
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new Uint8Array([
            0x64, 0x61, 0x74, 0x61, 0x3a, 0x20, 0x31, 0x0a, 0x0a,
          ]),
        ); // 'data: 1\n\n'
        controller.enqueue(
          new Uint8Array([
            0x64, 0x61, 0x74, 0x61, 0x3a, 0x20, 0x32, 0x0a, 0x0a,
          ]),
        ); // 'data: 2\n\n'
        controller.close();
      },
    });

    const generator = generateChunks(mockStream, parseChunk);
    const result1 = await generator.next();
    const result2 = await generator.next();
    const result3 = await generator.next();

    expect(result1.value).toBe('data: 1');
    expect(result2.value).toBe('data: 2');
    expect(result3.done).toBe(true);
  });
});
