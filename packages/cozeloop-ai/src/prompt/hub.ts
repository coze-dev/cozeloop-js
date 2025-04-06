// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { ensureProperty, EnvKeys } from '../utils/env';
import { mergeConfig } from '../utils/common';
import {
  toLoopTraceSpanPromptTemplateInput,
  toLoopTraceSpanPromptTemplateMessages,
} from '../tracer/utils/adapt';
import { formatPromptTemplate } from './utils';
import { type PromptVariables, type PromptHubOptions } from './types';
import { PromptCache } from './cache';
import { COZELOOP_TRACE_TAGS, SpanKind, cozeLoopTracer } from '../tracer';
import { type Prompt, PromptApi } from '../api';

export class PromptHub {
  private _options: PromptHubOptions;
  private readonly _cache: PromptCache;
  private _api: PromptApi;

  /** Promopt cache instance */
  get cache() {
    return this._cache;
  }

  constructor(options: PromptHubOptions) {
    const workspaceId = ensureProperty({
      propName: 'workspaceId',
      envKey: EnvKeys.WORKSPACE_ID,
      value: options.workspaceId,
      tag: 'PromptHub',
    });

    this._options = mergeConfig<PromptHubOptions>(options, { workspaceId });

    this._api = new PromptApi(this._options.apiClient);

    this._cache = new PromptCache(options.cacheOptions || {}, this._api);
    this._cache.startPollingUpdate(workspaceId);
  }

  private async _getPrompt(key: string, version?: string) {
    // 1. try to get prompt from cache
    const promptInCache = this._cache.get(key, version);

    if (promptInCache) {
      return promptInCache;
    }

    // 2. pull prompt if no cache
    const resp = await this._api.pullPrompt({
      workspace_id: this._options.workspaceId || '',
      queries: [{ prompt_key: key, version }],
    });

    const promptPulled = resp.data?.items?.[0].prompt;

    // 3. update cache
    if (promptPulled) {
      this._cache.update(key, version, promptPulled);
    }

    return promptPulled;
  }

  /**
   * Get prompt by key and version
   *
   * @param key Prompt key
   * @param version Prompt version(optional), latest version by default
   *
   * @example
   * ```typescript
   * // 1. get prompt with version 0.0.1
   * await hub.get('your_prompt_key', '0.0.1');
   *
   * // 2. get prompt with latest version
   * await hub.get('your_prompt_key');
   * ```
   */
  async getPrompt(key: string, version?: string) {
    if (this._options.traceable) {
      return cozeLoopTracer.traceable(
        async () => await this._getPrompt(key, version),
        {
          name: 'PromptHub',
          type: SpanKind.PromptHub,
          attributes: {
            [COZELOOP_TRACE_TAGS.SPAN_INPUT]: JSON.stringify({
              prompt_key: key,
              prompt_version: version,
            }),
            prompt_key: key,
            prompt_version: version,
          },
        },
      );
    }

    return this._getPrompt(key, version);
  }

  /**
   * Format prompt to message list with variables
   *
   * @param prompt Prompt
   * @param variables Prompt interpolate variables
   *
   * ```typescript
   * const prompt = await hub.get('your_prompt_key');
   *
   * // format prompt to messages with variables
   * const messages = hub.formatPrompt(prompt, { key: 'value' });
   * ```
   */
  formatPrompt(prompt?: Prompt, variables?: PromptVariables) {
    if (this._options.traceable) {
      return cozeLoopTracer.traceable(
        span => {
          const messages = formatPromptTemplate(
            prompt?.prompt_template,
            variables,
          );
          span.setAttribute(
            COZELOOP_TRACE_TAGS.SPAN_OUTPUT,
            JSON.stringify(toLoopTraceSpanPromptTemplateMessages(messages)),
          );

          return messages;
        },
        {
          name: 'PromptTemplate',
          type: SpanKind.PromptTemplate,
          attributes: {
            [COZELOOP_TRACE_TAGS.SPAN_INPUT]: JSON.stringify(
              toLoopTraceSpanPromptTemplateInput(
                prompt?.prompt_template.messages,
                variables,
              ),
            ),
            prompt_key: prompt?.prompt_key,
            prompt_version: prompt?.version,
          },
        },
      );
    }

    return formatPromptTemplate(prompt?.prompt_template, variables);
  }
}
