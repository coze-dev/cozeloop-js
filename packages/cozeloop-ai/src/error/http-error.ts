// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any -- some error is any */
import { type AxiosResponseHeaders, isAxiosError } from 'axios';

import {
  HttpStatusCode,
  InternalApiStatusCode,
  type ErrorDetail,
} from './types';

export class HttpError extends Error {
  private readonly _detail: ErrorDetail;
  name = 'HttpError';

  constructor(detail: ErrorDetail) {
    super();
    this._detail = detail;

    if (detail.name) {
      this.name = detail.name;
    }
  }

  get code() {
    return this._detail?.result?.code ?? -1;
  }

  get message() {
    const { status, result, message, headers } = this._detail;
    if (!result && message) {
      return message;
    }

    const logId = result?.detail?.logid ?? headers?.['x-tt-logid'];

    if (result) {
      const msgs: string[] = [];
      const { code, msg } = result;

      code && msgs.push(`code: ${code}`);
      msg && msgs.push(`msg: ${msg}`);
      logId && msgs.push(`logId: ${logId}`);

      return msgs.join(', ');
    }

    return status
      ? `http status code: ${status} (no body)`
      : '(no status code or body)';
  }
}

export function getErrorName(status: number, code?: number) {
  if (
    status === HttpStatusCode.BadRequest ||
    code === InternalApiStatusCode.BadRequest
  ) {
    return 'BadRequestError';
  }

  if (
    status === HttpStatusCode.Unauthorized ||
    code === InternalApiStatusCode.Unauthorized
  ) {
    return 'AuthenticationError';
  }

  if (
    status === HttpStatusCode.Forbidden ||
    code === InternalApiStatusCode.Forbidden
  ) {
    return 'PermissionDeniedError';
  }

  if (
    status === HttpStatusCode.NotFound ||
    code === InternalApiStatusCode.NotFound
  ) {
    return 'NotFoundError';
  }

  if (
    status === HttpStatusCode.TooManyRequests ||
    code === InternalApiStatusCode.TooManyRequests
  ) {
    return 'RateLimitError';
  }

  if (status === HttpStatusCode.RequestTimeout) {
    return 'TimeoutError';
  }

  if (status === HttpStatusCode.BadGateway) {
    return 'GatewayError';
  }

  if (status >= HttpStatusCode.InternalServerError) {
    return 'InternalServerError';
  }
}

export function handleError(error: any) {
  // axios error like
  if (isAxiosError(error) || (error.code && error.message)) {
    // timeout
    if (
      (error.code === 'ECONNABORTED' && error.message.includes('timeout')) ||
      error.code === 'ETIMEDOUT'
    ) {
      return new HttpError({
        name: 'TimeoutError',
        status: HttpStatusCode.RequestTimeout,
        message: `Request timeout: ${error.message}`,
        headers: error.response?.headers as AxiosResponseHeaders,
      });
    }

    // abort
    if (error.code === 'ERR_CANCELED') {
      return new HttpError({
        status: 0,
        name: 'UserAbortError',
        message: `Request aborted: ${error.message}`,
      });
    }

    const status = error.response?.status || HttpStatusCode.InternalServerError;

    return new HttpError({
      name: getErrorName(status, Number(error.code)),
      status,
      message: error.message,
      result: error.response?.data,
      headers: error.response?.headers as AxiosResponseHeaders,
    });
  }
}

export function checkApiResponse(
  result: any,
  status: number,
  headers?: AxiosResponseHeaders,
) {
  if (typeof result?.code === 'number' && result.code !== 0) {
    throw new HttpError({
      name: 'ApiError',
      status,
      result,
      message: result.msg ? `${result.msg}` : undefined,
      headers,
    });
  }
}
