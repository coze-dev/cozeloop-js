// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { ensureProperty, EnvKeys } from '../utils/env';
import { mergeConfig } from '../utils/common';
import {
  type ExecutePromptReply,
  type ExecutePromptReq,
  PromptApi,
} from '../api';
import {
  type PromptExecuteOptions,
  type PromptAsAServiceOptions,
} from './types';
import { toVariableVals, toLoopMessages } from './converter';
import {
  calcSpanTraceHeaders,
  COZELOOP_TRACE_BUSINESS_TAGS,
  cozeLoopTracer,
  SpanKind,
} from '../tracer';
import { toPtaaSReqTags, toPtaasRespTags } from './trace';
import { collectReplyStream } from './collect-stream';

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

  /**
   * Invoke prompt-as-a-service
   *
   * @param options {@link PromptExecuteOptions}
   *
   * @example
   * ```typescript
   *
   * // 1. invoke with messages
   * const model = new PromptAsAService({
   *   workspaceId: 'your_workspace_id',
   *   prompt: {
   *     prompt_key: 'your_prompt_key',
   *     // version: '0.0.1',
   *   },
   *   apiClient: {
   *     token: 'pat_xxx',
   *   },
   * });
   *
   * const reply = await model.invoke({
   *   messages: [
   *     { role: 'user', content: 'hi' },
   *   ],
   * });
   *
   * // 2. invoke, and specify prompt at runtime
   * const model = new PromptAsAService({});
   *
   * const reply = await model.invoke({
   *   // higher priority than PromptAsAService constructor params
   *   prompt: {
   *     prompt_key: 'your_prompt_key',
   *     // version: '0.0.1',
   *   },
   *   messages: [
   *     { role: 'user', content: 'hi' },
   *   ],
   * });
   * ```
   */
  async invoke(options: PromptExecuteOptions) {
    const req = this._getExecuteReq(options);
    if (this._options.traceable) {
      return await cozeLoopTracer.traceable(
        async span => {
          const headers = calcSpanTraceHeaders(span);
          const resp = await this._api.executePrompt(req, { headers });

          cozeLoopTracer.setTags(span, toPtaasRespTags(resp.data));

          return resp.data;
        },
        {
          name: 'PtaaS',
          type: SpanKind.Model,
          attributes: toPtaaSReqTags(req),
        },
      );
    }

    const resp = await this._api.executePrompt(req);

    return resp.data;
  }

  /**
   * Streaming-invoke prompt-as-a-service
   *
   * @param options {@link PromptExecuteOptions}
   * @param onFinish - full reply from stream
   *
   * @example
   * ```typescript
   *
   * // 1. stream with messages
   * const model = new PromptAsAService({});
   *
   * const replyStream = await model.invoke({
   *   messages: [
   *     { role: 'user', content: 'hi' },
   *   ],
   * });
   *
   * for await (const chunk of replyStream) {
   *   // chunk is {@link PromptExecuteOptions}
   * }
   *
   * ```
   */
  async stream(
    options: PromptExecuteOptions,
    onFinish?: (reply: ExecutePromptReply) => void,
  ) {
    const req = this._getExecuteReq(options);
    if (this._options.traceable) {
      return cozeLoopTracer.traceable(
        async span => {
          const headers = calcSpanTraceHeaders(span);
          const resp = await this._api.streamingExecutePrompt(req, { headers });
          const { stream: collectedStream } = collectReplyStream(
            resp,
            () => {
              cozeLoopTracer.setTag(
                span,
                COZELOOP_TRACE_BUSINESS_TAGS.START_TIME_FIRST_RESP,
                Date.now() * 1_000,
              );
            },
            collected => {
              onFinish?.(collected);
              cozeLoopTracer.setTags(span, toPtaasRespTags(collected));
              span.end();
            },
          );
          return collectedStream;
        },
        {
          name: 'PtaaS',
          type: SpanKind.Model,
          recordOutputs: false,
          endWhenDone: false,
          attributes: toPtaaSReqTags(req, true),
        },
      );
    }

    const resp = await this._api.streamingExecutePrompt(req);

    const { stream: collectedStream } = collectReplyStream(
      resp,
      undefined,
      onFinish,
    );

    return collectedStream;
  }
}
