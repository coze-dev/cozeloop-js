// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { AxiosError, AxiosHeaders } from 'axios';

import { HttpStatusCode, InternalApiStatusCode } from '../../src/error/types';
import {
  checkApiResponse,
  getErrorName,
  handleError,
  HttpError,
} from '../../src/error/http-error';

describe('HttpError', () => {
  it('should create an instance with correct name and message', () => {
    const error = new HttpError({
      name: 'TestError',
      status: 400,
      result: { code: 1, msg: 'Test message' },
      headers: { 'x-tt-logid': '123456' },
    });

    expect(error.name).toBe('TestError');
    expect(error.message).toBe('code: 1, msg: Test message, logId: 123456');
  });

  it('should handle cases without result', () => {
    const error = new HttpError({
      status: 404,
      message: 'Not Found',
    });

    expect(error.message).toBe('Not Found');
  });
});

describe('handleError', () => {
  it('should handle timeout errors', () => {
    const axiosError = new AxiosError(
      'timeout of 1000ms exceeded',
      'ECONNABORTED',
    );
    const error = handleError(axiosError);

    expect(error).toBeInstanceOf(HttpError);
    expect(error?.name).toBe('TimeoutError');
    expect(error?.message).toContain('Request timeout');
  });

  it('should handle aborted requests', () => {
    const axiosError = new AxiosError('Request aborted', 'ERR_CANCELED');
    const error = handleError(axiosError);

    expect(error).toBeInstanceOf(HttpError);
    expect(error?.name).toBe('UserAbortError');
    expect(error?.message).toContain('Request aborted');
  });

  it('should handle other axios errors', () => {
    const axiosError = new AxiosError(
      'Not Found',
      '404',
      undefined,
      undefined,
      {
        status: 404,
        data: { code: 404, msg: 'Resource not found' },
        headers: new AxiosHeaders(),
      } as any,
    );
    const error = handleError(axiosError);

    expect(error).toBeInstanceOf(HttpError);
    expect(error?.name).toBe('NotFoundError');
    expect(error?.message).toContain('Resource not found');
  });
});

describe('checkApiResponse', () => {
  it('should throw HttpError for non-zero code', () => {
    const result = { code: 1, msg: 'Error occurred' };
    expect(() => checkApiResponse(result, 200)).toThrow(HttpError);
  });

  it('should not throw for zero code', () => {
    const result = { code: 0, data: 'Success' };
    expect(() => checkApiResponse(result, 200)).not.toThrow();
  });
});

describe('getErrorName', () => {
  it('should return correct error names based on status codes', () => {
    expect(getErrorName(HttpStatusCode.BadRequest)).toBe('BadRequestError');
    expect(getErrorName(HttpStatusCode.Unauthorized)).toBe(
      'AuthenticationError',
    );
    expect(getErrorName(HttpStatusCode.Forbidden)).toBe(
      'PermissionDeniedError',
    );
    expect(getErrorName(HttpStatusCode.NotFound)).toBe('NotFoundError');
    expect(getErrorName(HttpStatusCode.TooManyRequests)).toBe('RateLimitError');
    expect(getErrorName(HttpStatusCode.RequestTimeout)).toBe('TimeoutError');
    expect(getErrorName(HttpStatusCode.BadGateway)).toBe('GatewayError');
    expect(getErrorName(HttpStatusCode.InternalServerError)).toBe(
      'InternalServerError',
    );
  });

  it('should return correct error names based on internal API status codes', () => {
    expect(getErrorName(200, InternalApiStatusCode.BadRequest)).toBe(
      'BadRequestError',
    );
    expect(getErrorName(200, InternalApiStatusCode.Unauthorized)).toBe(
      'AuthenticationError',
    );
    expect(getErrorName(200, InternalApiStatusCode.Forbidden)).toBe(
      'PermissionDeniedError',
    );
    expect(getErrorName(200, InternalApiStatusCode.NotFound)).toBe(
      'NotFoundError',
    );
    expect(getErrorName(200, InternalApiStatusCode.TooManyRequests)).toBe(
      'RateLimitError',
    );
  });
});
