// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  clearIntervalAsync,
  setIntervalAsync,
  type SetIntervalAsyncTimer,
} from 'set-interval-async';
import { clone, chunk } from 'remeda';
import QuickLRU from 'quick-lru';

import { type PromptCacheOptions } from './types';
import type { Prompt, PromptApi, PromptQuery } from '../api';
import { cacheKeyToQuery, queryToCacheKey } from './utils';

const DEFAULT_MAX_SIZE = 100;
const DEFAULT_REFRESH_INTERVAL = 60_000;
const DEFAULT_BATCH_QUERY_SIZE = 30;

export class PromptCache {
  private _options: PromptCacheOptions;
  private _lru: QuickLRU<string, Prompt>;
  private _api: PromptApi;
  private _timer: SetIntervalAsyncTimer<[]> | undefined;

  constructor(options: PromptCacheOptions, api: PromptApi) {
    this._options = options;
    this._api = api;
    this._lru = new QuickLRU({ maxSize: options.maxSize ?? DEFAULT_MAX_SIZE });
  }

  async pollingUpdate(workspaceId: string) {
    const cacheKeys = [...this._lru.keys()];

    if (!cacheKeys.length) {
      return;
    }

    const updatePromptByKeys = async (keys: string[]) => {
      const resp = await this._api.pullPrompt({
        workspace_id: workspaceId,
        queries: keys.map(it => cacheKeyToQuery(it)),
      });

      resp.data?.items?.map(({ query, prompt }) => this.update(query, prompt));
    };

    try {
      const keyGroups = chunk(cacheKeys, DEFAULT_BATCH_QUERY_SIZE);

      await Promise.allSettled(keyGroups.map(it => updatePromptByKeys(it)));
    } catch (e) {
      console.error(`[PromptCache] polling update error: ${e}`);
    }
  }

  startPollingUpdate(workspaceId: string) {
    const { refreshInterval = DEFAULT_REFRESH_INTERVAL } = this._options;

    this._timer = setIntervalAsync(
      () => this.pollingUpdate(workspaceId),
      refreshInterval,
    );
  }

  get(query: PromptQuery) {
    const cacheKey = queryToCacheKey(query);
    const prompt = this._lru.get(cacheKey);

    return clone(prompt);
  }

  update(query: PromptQuery, prompt: Prompt) {
    const cacheKey = queryToCacheKey(query);

    return this._lru.set(cacheKey, prompt);
  }

  delete(query: PromptQuery) {
    const cacheKey = queryToCacheKey(query);

    return this._lru.delete(cacheKey);
  }

  clear() {
    if (this._timer) {
      clearIntervalAsync(this._timer);
      this._timer = undefined;
    }

    this._lru.clear();
  }
}
