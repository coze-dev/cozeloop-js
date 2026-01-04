// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import axios from 'axios';

import { setupBaseHttpMock } from '../__mock__/base-http';
import { compareVersions } from '../../src/utils/common';
import {
  getNodeStreamAdapter,
  isAxiosStatic,
} from '../../src/api/api-client/utils';
import { http } from '../../src/api';

vi.mock('axios');
vi.mock('../../src/utils/common');
vi.mock('../../src/api/api-client/utils');

describe('http', () => {
  const httpMock = setupBaseHttpMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => httpMock.reset());

  it('should throw an error for streaming requests with axios version below 1.7.1', async () => {
    (compareVersions as any).mockReturnValue(-1);
    (isAxiosStatic as any).mockReturnValue(true);

    await expect(http({ streaming: true })).rejects.toThrowError(
      'Streaming requests require axios version 1.7.1 or higher. Please upgrade your axios version.',
    );
  });

  it('should call axios with correct options for non-streaming request', async () => {
    const axiosInstance = axios.create();
    const mockResponse = { data: 'mock data' };
    (axios as any).mockResolvedValue(mockResponse);

    const result = await http({ axiosInstance, url: 'https://example.com' });

    expect(axios).toHaveBeenCalledWith({
      responseType: 'json',
      adapter: getNodeStreamAdapter(false),
      url: 'https://example.com',
    });
    expect(result.json()).toBe(mockResponse.data);
  });

  it('should call axios with correct options for streaming request', async () => {
    const axiosInstance = axios.create();
    const mockStream = { on: vi.fn(), pipe: vi.fn() };
    (axios as any).mockResolvedValue({ data: mockStream });
    (compareVersions as any).mockReturnValue(1);
    (isAxiosStatic as any).mockReturnValue(true);

    await http({
      axiosInstance,
      streaming: true,
      url: 'https://example.com/stream',
    });

    expect(axios).toHaveBeenCalledWith({
      responseType: 'stream',
      adapter: getNodeStreamAdapter(true),
      url: 'https://example.com/stream',
    });
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('mock error');
    (axios as any).mockRejectedValue(mockError);

    await expect(http({ url: 'https://example.com/basic' })).rejects.toThrow(
      'mock error',
    );
  });
});
