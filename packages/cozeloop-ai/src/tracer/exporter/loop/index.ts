// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type ReadableSpan,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-node';

import { COZELOOP_TRACE_IDENTIFIER } from '../../constants';
import { CozeLoopTraceClient } from '../../client';
import { type LoopApiClient } from '../../../api/types';

interface LoopTraceExporterOptions {
  apiClient: LoopApiClient;
  workspaceId: string;
}

export class CozeLoopTraceExporter implements SpanExporter {
  protected _workspaceId: string;
  protected _loopTraceClient: CozeLoopTraceClient;

  constructor(options: LoopTraceExporterOptions) {
    const { workspaceId, apiClient } = options;

    this._workspaceId = workspaceId;
    this._loopTraceClient = new CozeLoopTraceClient({
      apiClient,
      workspaceId: this._workspaceId,
    });
  }

  export(spans: ReadableSpan[]): void {
    this._loopTraceClient.endSpans(
      spans.filter(
        span =>
          span.instrumentationLibrary.name === COZELOOP_TRACE_IDENTIFIER.LOOP,
      ),
    );
  }

  async shutdown(): Promise<void> {
    await console.warn(
      '[LoopSDKTracerWarning]: Shutdown CozeLoopTraceExporter',
    );
  }

  async forceFlush(): Promise<void> {
    await console.warn(
      '[LoopSDKTracerWarning]: Forces to export all finished spans',
    );
  }
}
