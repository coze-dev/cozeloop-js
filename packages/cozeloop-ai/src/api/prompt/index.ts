// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { BaseApi } from '../base';
import type { PullPromptReq, PullPromptResp } from './types';

export type * from './types';

export class PromptApi extends BaseApi {
  pullPrompt(req: PullPromptReq) {
    const url = '/v1/loop/prompts/mget';

    return this._client.post<PullPromptResp>(url, req);
  }
}
