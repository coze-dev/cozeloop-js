// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { ensureProperty, EnvKeys } from '../utils/env';
import { mergeConfig } from '../utils/common';
import { type ExecutePromptReq, PromptApi } from '../api';
import {
  type PromptExecuteOptions,
  type PromptAsAServiceOptions,
} from './types';
import { toVariableVals, toLoopMessages } from './converter';

export class PromptAsAService {
  private _options: PromptAsAServiceOptions;
  private _api: PromptApi;

  constructor(options: PromptAsAServiceOptions) {
    const workspaceId = ensureProperty({
      propName: 'workspaceId',
      envKey: EnvKeys.WORKSPACE_ID,
      value: options.workspaceId,
      tag: 'PromptService',
    });
    this._options = mergeConfig<PromptAsAServiceOptions>(options, {
      workspaceId,
    });
    this._api = new PromptApi(this._options.apiClient);
  }

  private _getExecuteReq(options: PromptExecuteOptions) {
    // const { messages, variables, prompt } = options;
    const prompt = options.prompt ?? this._options.prompt;
    if (typeof prompt === 'undefined') {
      throw new Error('[PromptAsAService] Prompt is unprovided');
    }

    const req: ExecutePromptReq = {
      workspace_id: this._options.workspaceId,
      prompt_identifier: prompt,
      variable_vals: toVariableVals(options.variables),
      messages: toLoopMessages(options.messages),
    };

    return req;
  }

  async invoke(options: PromptExecuteOptions) {
    const req = this._getExecuteReq(options);
    const resp = await this._api.executePrompt(req);

    return resp.data;
  }

  stream(options: PromptExecuteOptions) {
    const req = this._getExecuteReq(options);
    const resp = this._api.streamingExecutePrompt(req);

    return resp;
  }
}
