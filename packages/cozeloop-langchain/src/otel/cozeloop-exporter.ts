// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { globalErrorHandler } from '@opentelemetry/core';

import {
  type CozeloopSpanExporterOptions,
  CozeloopSpanExporterOptionsSchema,
} from './schema';
import { BatchingQueue } from './batching-queue';

export class CozeloopSpanExporter {
  private _exporter: OTLPTraceExporter;
  private _queue: BatchingQueue<ReadableSpan>;

  private static WORKSPACE_ID_HEADER = 'cozeloop-workspace-id';

  constructor(options: CozeloopSpanExporterOptions) {
    const {
      token,
      workspaceId,
      headers,
      traceEndpoint,
      batchSize,
      scheduleDelay,
    } = CozeloopSpanExporterOptionsSchema.parse(options);

    this._exporter = new OTLPTraceExporter({
      url: traceEndpoint,
      headers: {
        Authorization: `Bearer ${token}`,
        [CozeloopSpanExporter.WORKSPACE_ID_HEADER]: workspaceId,
        ...headers,
      },
    });

    this._queue = new BatchingQueue<ReadableSpan>(
      batchSize,
      scheduleDelay,
      spans => this._onExport(spans),
    );
  }

  private _onExport(spans: ReadableSpan[]) {
    return new Promise<number>(resolve => {
      this._exporter.export(spans, result => {
        result.code !== 0 &&
          globalErrorHandler(result.error || 'Export span error');
        resolve(result.code);
      });
    });
  }

  enqueue(span: ReadableSpan) {
    this._queue.enqueue(span);
  }

  async flush() {
    await this._queue.flush();
    await this._exporter.forceFlush();
  }

  async shutdown() {
    await this.flush();
    await this._exporter.shutdown();
  }
}
