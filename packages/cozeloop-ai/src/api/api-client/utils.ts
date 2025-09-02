// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import nodeFetch, { type RequestInit } from 'node-fetch';
import { type AxiosStatic, type CreateAxiosDefaults } from 'axios';

export function getNodeStreamAdapter(
  streaming?: boolean,
): CreateAxiosDefaults['adapter'] {
  if (!streaming) {
    return;
  }

  if (typeof fetch === 'function') {
    return 'fetch';
  }

  // streaming via node-fetch
  return async config => {
    const {
      url,
      baseURL,
      method = 'get',
      data,
      headers,
      params,
      timeout,
    } = config;
    if (!url) {
      throw new Error('Url is required');
    }

    const fullUrl = new URL(url, baseURL);
    // Add query parameters
    if (params) {
      Object.keys(params).forEach(key =>
        fullUrl.searchParams.append(key, params[key]),
      );
    }

    // Prepare fetch request
    const request: RequestInit = {
      method: method.toUpperCase(),
      headers: headers || {},
      timeout,
    };

    // Add body for non-GET requests
    if (data && method.toLowerCase() !== 'get') {
      request.body = JSON.stringify(data);
    }

    // Make the request using node-fetch
    const response = await nodeFetch(fullUrl.toString(), request);

    // Construct the Axios response
    return {
      data: response.body,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers ?? {}),
      config,
      request,
    };
  };
}

export function isAxiosStatic(instance: unknown): instance is AxiosStatic {
  return !!(instance as AxiosStatic)?.Axios;
}

/** parse chunk to type T (as a object) */
export function parseEventChunk<T>(chunk: string) {
  const lines = chunk.split('\n');
  let event = '';
  let data = '';
  for (const line of lines) {
    if (line.startsWith('event')) {
      event = line.replace(/^event:\s*/, '');
    }

    if (line.startsWith('data:')) {
      data = line.replace(/^data:\s*/, '');
    }
  }

  if (event === 'gateway-error') {
    throw new Error(data || 'gateway-error');
  }

  return JSON.parse(data) as T;
}

/**
 * parse stream to chunks
 *
 * @param stream `ReadableStream<Uint8Array>` | `NodeJS.ReadableStream`
 * @param parseChunk chunk => T
 * @returns `Generator<T>`
 */
export async function* generateChunks<T>(
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream | undefined | null,
  parseChunk: (chunk: string) => T,
) {
  if (!stream) {
    yield parseChunk('');
    return;
  }

  let _cache = '';
  const sep = '\n';
  const min_chunk_size = 5;
  const decoder = new TextDecoder();
  for await (const chunk of stream as AsyncIterable<
    string | Uint8Array | Buffer
  >) {
    let s =
      typeof chunk === 'string'
        ? chunk
        : chunk.constructor.name === 'Buffer'
          ? chunk.toString('utf-8')
          : decoder.decode(chunk, { stream: true });

    if (_cache) {
      s = `${_cache}${s}`;
      _cache = '';
    }
    const size = s.length;
    if (size < min_chunk_size) {
      _cache = s;
      continue;
    }

    let start = 0;

    for (let i = 0; i < size - 1; i++) {
      if (s[i] === sep && s[i + 1] === sep) {
        // no
        if (i < 1) {
          continue;
        }

        // consume [0, i)
        yield parseChunk(s.substring(start, i));
        start = i + 2;
      }
    }

    if (start < size) {
      _cache = s.substring(start);
    }
  }
}
