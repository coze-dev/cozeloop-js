// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type PullPromptReq, type PullPromptResp } from './types/prompt';
import {
  type ExecutePromptResp,
  type ExecutePromptReq,
  type StreamingExecutePromptResp,
} from './types/execute';
import { BaseApi } from '../base';
import { type RequestOptions } from '../api-client';

export type * from './types/common';
export type * from './types/execute';
export type * from './types/prompt';

export class PromptApi extends BaseApi {
  pullPrompt(req: PullPromptReq) {
    const url = '/v1/loop/prompts/mget';

    return this._client.post<PullPromptResp>(url, req);
  }

  executePrompt(req: ExecutePromptReq, options?: RequestOptions) {
    const url = '/v1/loop/prompts/execute';

    return this._client.post<ExecutePromptResp>(url, req, false, options);
  }

  streamingExecutePrompt(req: ExecutePromptReq, options?: RequestOptions) {
    const url = '/v1/loop/prompts/execute_streaming';

    return this._client.post<StreamingExecutePromptResp>(
      url,
      req,
      true,
      options,
    );
  }
}
