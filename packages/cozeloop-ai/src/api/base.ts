// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type LoopApiClient } from './types';
import { ApiClient } from './api-client';

export type BaseApiResp<T = never> = [T] extends [never]
  ? {
      code: number;
      msg: string;
    }
  : {
      code: number;
      msg: string;
      data?: T;
    };

export abstract class BaseApi {
  protected _client: ApiClient;

  constructor(client: LoopApiClient) {
    this._client = client instanceof ApiClient ? client : new ApiClient(client);
  }
}
