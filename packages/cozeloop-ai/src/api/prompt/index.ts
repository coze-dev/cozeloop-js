// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type PullPromptReq, type PullPromptResp } from './types/prompt';
import { type ExecutePromptResp, type ExecutePromptReq } from './types/execute';
import { BaseApi } from '../base';

export type * from './types/common';
export type * from './types/execute';
export type * from './types/prompt';

export class PromptApi extends BaseApi {
  pullPrompt(req: PullPromptReq) {
    const url = '/v1/loop/prompts/mget';

    return this._client.post<PullPromptResp>(url, req);
  }

  executePrompt(req: ExecutePromptReq) {
    const url = '/v1/loop/prompts/execute';

    return this._client.post<ExecutePromptResp>(url, req);
  }

  streamingExecutePrompt(req: ExecutePromptReq) {
    const url = '/v1/loop/prompts/execute_streaming';

    return this._client.post<ExecutePromptResp>(url, req);
  }
}
