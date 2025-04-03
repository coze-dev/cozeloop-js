// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-node';

import { LoopTraceSpanConverter } from '../../utils/client';
import { type LoopApiClient } from '../../../api/types';
import { TraceApi } from '../../../api';

interface LoopTraceClientInitOptions {
  apiClient: LoopApiClient;
  workspaceId: string;
}

export class CozeLoopTraceClient {
  protected _api: TraceApi;
  protected _workspaceId: string;

  constructor(options: LoopTraceClientInitOptions) {
    const { workspaceId, apiClient } = options;
    this._workspaceId = workspaceId;
    this._api = new TraceApi(apiClient);
  }

  endSpans(spans: ReadableSpan[]) {
    try {
      this._api.reportTrace({
        spans: spans.map(span => {
          let converter: LoopTraceSpanConverter | null =
            new LoopTraceSpanConverter({
              span,
              api: this._api,
              workspaceId: this._workspaceId,
            });

          const loopSpan = converter.toLoopSpan();
          converter = null;

          return loopSpan;
        }),
      });
    } catch (error) {
      console.error(
        `[LoopSDKTracerError]: Report span error, errorMessage=${error instanceof Error ? error.message : '-'}`,
      );
    }
  }
}
