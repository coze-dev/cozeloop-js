// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupBaseHttpMock } from '../__mock__/base-http';
import { simpleConsoleLogger } from '../../src/utils/logger';
import { ApiClient } from '../../src/api/api-client';

interface BaseHttpResp {
  method: string;
  headers: Record<string, string>;
}

describe('Http Test', () => {
  const httpMock = setupBaseHttpMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  afterEach(() => httpMock.reset());

  const apiClient = new ApiClient({
    baseURL: 'https://mock.loop.com',
    logger: simpleConsoleLogger,
  });

  it('Basic GET', async () => {
    const resp = await apiClient.get<BaseHttpResp>('/basic');

    expect(resp.method).toBe('GET');
  });

  it('Basic POST', async () => {
    const resp = await apiClient.post<BaseHttpResp>('/basic');

    expect(resp.method).toBe('POST');
  });

  it('Basic POST streaming', async () => {
    const resp = await apiClient.post<AsyncGenerator<{ seq: number }>>(
      '/stream',
      undefined,
      true,
    );
    for await (const chunk of resp) {
      expect(chunk).toBeTruthy();
    }
  });

  it('Basic POST streaming with parse error', async () => {
    const resp = await apiClient.post<AsyncGenerator<{ seq: number }>>(
      '/stream-parse-error',
      undefined,
      true,
    );

    await expect(async () => {
      for await (const chunk of resp) {
        console.info(chunk);
      }
    }).rejects.toThrowError(SyntaxError);
  });

  it('Basic POST streaming with event error', async () => {
    const resp = await apiClient.post<AsyncGenerator<{ seq: number }>>(
      '/stream-event-error',
      undefined,
      true,
    );

    await expect(async () => {
      for await (const chunk of resp) {
        console.info(chunk);
      }
    }).rejects.toThrowError(/500 Bad Gateway/);
  });

  it('Basic PUT', async () => {
    const resp = await apiClient.put<BaseHttpResp>('/basic');

    expect(resp.method).toBe('PUT');
  });

  it('Basic DELETE', async () => {
    const resp = await apiClient.delete<BaseHttpResp>('/basic');

    expect(resp.method).toBe('DELETE');
  });
});
