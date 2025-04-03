// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { SimpleLogger } from '../../utils/logger';

export interface GetApiTokenFn {
  (): string | Promise<string>;
}

export type RequestOptions = Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'baseURL' | 'data' | 'responseType'
>;

export interface ApiClientOptions {
  /**
   * Api baseURL, default value is:
   * * process.env.COZELOOP_API_BASE_URL
   * * https://api.coze.cn
   */
  baseURL?: string;
  /**
   * Api Token
   * * Personal Access Token (PAT) or OAuth2.0 token, or a function to get token
   * * else use process.env.COZELOOP_API_TOKEN
   */
  token?: string | GetApiTokenFn;
  /**
   * Partial [axios request-config](https://github.com/axios/axios?tab=readme-ov-file#request-config), excludes url, method, baeURL, data and responseType.
   */
  axiosOptions?: RequestOptions;
  /** Custom axios instance */
  axiosInstance?: AxiosInstance;
  /** Custom headers */
  headers?: Record<string, unknown>;
  /** A logger function to print debug message */
  logger?: SimpleLogger;
}

export interface HttpOptions extends AxiosRequestConfig {
  axiosInstance?: AxiosInstance;
  streaming?: boolean;
}
