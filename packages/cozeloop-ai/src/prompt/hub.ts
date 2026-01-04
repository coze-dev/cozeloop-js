// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { ensureProperty, EnvKeys } from '../utils/env';
import { mergeConfig } from '../utils/common';
import { formatPromptTemplate } from './utils';
import { type PromptVariables, type PromptHubOptions } from './types';
import { PromptCache } from './cache';
import {
  COZELOOP_TRACE_BUSINESS_TAGS,
  COZELOOP_TRACE_BASIC_TAGS,
  SpanKind,
  cozeLoopTracer,
} from '../tracer';
import { type Prompt, PromptApi, type PromptQuery } from '../api';
import {
  toPromptHubInput,
  toPromptTemplateInput,
  toPromptTemplateOutput,
} from './trace';

export class PromptHub {
  private _options: PromptHubOptions;
  private _api: PromptApi;
  private readonly _cache: PromptCache;

  /** Prompt cache instance */
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

  private async _getPrompt(query: PromptQuery) {
    // 1. try to get prompt from cache
    const promptInCache = this._cache.get(query);

    if (promptInCache) {
      return promptInCache;
    }

    // 2. pull prompt if no cache
    const resp = await this._api.pullPrompt({
      workspace_id: this._options.workspaceId || '',
      queries: [query],
    });

    const promptPulled = resp.data?.items?.[0].prompt;

    // 3. update cache
    if (promptPulled) {
      this._cache.update(query, promptPulled);
    }

    return promptPulled;
  }

  /**
   * Get prompt by key and version
   *
   * @param key Prompt key
   * @param version Prompt version(optional), latest version by default
   * @param label Publish label, priority: version > label
   *
   * @example
   * ```typescript
   * // 1. get prompt with version 0.0.1
   * await hub.get('your_prompt_key', '0.0.1');
   *
   * // 2. get prompt with latest version
   * await hub.get('your_prompt_key');
   *
   * // 3. get prompt with label like `beta`
   * await hub.get('your_prompt_key', undefined, 'beta')
   * ```
   */
  async getPrompt(key: string, version?: string, label?: string) {
    const query: PromptQuery = { prompt_key: key, version, label };
    if (this._options.traceable) {
      return cozeLoopTracer.traceable(
        async () => await this._getPrompt(query),
        {
          name: 'PromptHub',
          type: SpanKind.PromptHub,
          attributes: {
            [COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT]: toPromptHubInput(query),
            [COZELOOP_TRACE_BASIC_TAGS.SPAN_RUNTIME_SCENE]: 'prompt_hub',
            [COZELOOP_TRACE_BUSINESS_TAGS.PROMPT_KEY]: key,
            [COZELOOP_TRACE_BUSINESS_TAGS.PROMPT_VERSION]: version,
          },
        },
      );
    }

    return this._getPrompt(query);
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
          cozeLoopTracer.setInput(
            span,
            toPromptTemplateInput(prompt?.prompt_template.messages, variables),
          );
          cozeLoopTracer.setOutput(span, toPromptTemplateOutput(messages));

          return messages;
        },
        {
          name: 'PromptTemplate',
          type: SpanKind.PromptTemplate,
          recordOutputs: false,
          attributes: {
            [COZELOOP_TRACE_BASIC_TAGS.SPAN_RUNTIME_SCENE]: 'prompt_template',
            [COZELOOP_TRACE_BUSINESS_TAGS.PROMPT_KEY]: prompt?.prompt_key,
            [COZELOOP_TRACE_BUSINESS_TAGS.PROMPT_VERSION]: prompt?.version,
            [COZELOOP_TRACE_BUSINESS_TAGS.PROMPT_PROVIDER]: 'CozeLoop',
          },
        },
      );
    }

    return formatPromptTemplate(prompt?.prompt_template, variables);
  }
}
