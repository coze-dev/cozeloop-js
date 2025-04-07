// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type AxiosResponseHeaders } from 'axios';

import { LoopLoggable } from '../../utils/logger';
import { EnvKeys, getEnvVar } from '../../utils/env';
import { mergeConfig, safeNumber } from '../../utils/common';
import { checkApiResponse, PropertyUnprovidedError } from '../../error';
import { getUserAgentHeaders } from './user-agent';
import type { ApiClientOptions, RequestOptions, HttpOptions } from './types';
import { http } from './http';

export const DEFAULT_API_BASE_URL = 'https://api.coze.cn';

export class ApiClient extends LoopLoggable {
  private readonly _options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    super(options.logger, 'ApiClient');
    this._options = mergeConfig<ApiClientOptions>(options, {
      baseURL:
        getEnvVar(EnvKeys.API_BASE_URL, options.baseURL) ||
        DEFAULT_API_BASE_URL,
      token: options.token ?? getEnvVar(EnvKeys.API_TOKEN),
      axiosOptions: {
        timeout: safeNumber(getEnvVar(EnvKeys.REQUEST_TIMEOUT)),
      },
    });
  }

  protected async getToken() {
    const { token } = this._options;

    if (typeof token === 'undefined') {
      throw new PropertyUnprovidedError({
        tag: 'ApiClient',
        propName: 'token',
        envKey: EnvKeys.API_TOKEN,
      });
    }

    if (typeof token === 'string') {
      return token;
    }

    return await token();
  }

  protected async buildHttpOptions(
    options?: RequestOptions,
  ): Promise<HttpOptions> {
    const token = await this.getToken();
    const { axiosOptions, axiosInstance, headers } = this._options;
    const requestOptions = mergeConfig(axiosOptions, options, {
      headers: {
        Authorization: `Bearer ${token}`,
        // add this header to ensure i64 -> string
        'Agw-Js-Conv': 'str',
        ...getUserAgentHeaders(),
        ...headers,
      },
    });

    return {
      axiosInstance,
      ...requestOptions,
    };
  }

  // eslint-disable-next-line max-params -- skip
  private async _request<R, D>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: D,
    streaming?: boolean,
    options?: RequestOptions,
  ) {
    const fullUrl = `${this._options.baseURL || ''}${url}`;
    const httpOptions = await this.buildHttpOptions(options);
    httpOptions.data = body;
    httpOptions.url = fullUrl;
    httpOptions.method = method;
    httpOptions.streaming = streaming;

    this.loopLogger.debug('request url: ', `<${method}> `, fullUrl);
    this.loopLogger.debug('request httpOptions: ', httpOptions);

    const { response, json, stream } = await http(httpOptions);
    this.loopLogger.debug('response status: ', response.status);
    this.loopLogger.debug('response headers: ', response.headers);

    const contentType = (response.headers ??
      ((response as unknown as Record<string, string>).header || {}))[
      'content-type'
    ];
    const jsonMode = contentType && contentType.includes('application/json');

    if (streaming) {
      return stream() as R;
    }

    if (jsonMode) {
      const result = json() as R;
      checkApiResponse(
        result,
        response.status,
        response.headers as AxiosResponseHeaders,
      );

      return result;
    }

    return (await response.data) as R;
  }

  post<R, D = unknown>(
    url: string,
    body?: D,
    streaming?: boolean,
    options?: RequestOptions,
  ) {
    return this._request<R, D>(url, 'POST', body, streaming, options);
  }

  get<R, D = unknown>(
    url: string,
    params?: D,
    streaming?: boolean,
    options?: RequestOptions,
  ) {
    return this._request<R, D>(url, 'GET', undefined, streaming, {
      ...options,
      params,
    });
  }

  put<R, D = unknown>(
    url: string,
    body?: D,
    streaming?: boolean,
    options?: RequestOptions,
  ) {
    return this._request<R, D>(url, 'PUT', body, streaming, options);
  }

  delete<R, D = unknown>(
    url: string,
    body?: D,
    streaming?: boolean,
    options?: RequestOptions,
  ) {
    return this._request<R, D>(url, 'DELETE', body, streaming, options);
  }
}
