// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { simpleConsoleLogger } from '../src/utils/logger';
import { ApiClient } from '../src/api/api-client';
import { setupBaseHttpMock } from './mock/base-http';

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

  it('Basic PUT', async () => {
    const resp = await apiClient.put<BaseHttpResp>('/basic');

    expect(resp.method).toBe('PUT');
  });

  it('Basic DELETE', async () => {
    const resp = await apiClient.delete<BaseHttpResp>('/basic');

    expect(resp.method).toBe('DELETE');
  });
});
