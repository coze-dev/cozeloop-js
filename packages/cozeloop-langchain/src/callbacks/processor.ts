import {
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { globalErrorHandler } from '@opentelemetry/core';
import { type Context } from '@opentelemetry/api';

import {
  type CozeloopSpanProcessorOptions,
  CozeloopSpanProcessorOptionsSchema,
} from './schema';
import { BatchingQueue } from './batching-queue';

export class CozeloopSpanProcessor implements SpanProcessor {
  private _exporter: OTLPTraceExporter;
  private _queue: BatchingQueue<ReadableSpan>;

  private static WORKSPACE_ID_HEADER = 'cozeloop-workspace-id';

  constructor(options: Partial<CozeloopSpanProcessorOptions>) {
    const {
      token,
      workspaceId,
      headers,
      traceEndpoint,
      batchSize,
      scheduleDelay,
    } = CozeloopSpanProcessorOptionsSchema.parse(options);
    this._queue = new BatchingQueue<ReadableSpan>(
      batchSize,
      scheduleDelay,
      spans => this._onExport(spans),
    );
    this._exporter = new OTLPTraceExporter({
      url: traceEndpoint,
      headers: {
        Authorization: `Bearer ${token}`,
        [CozeloopSpanProcessor.WORKSPACE_ID_HEADER]: workspaceId,
        ...headers,
      },
    });
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

  onStart(span: Span, parentContext: Context): void {
    // no op
    // console.info(
    //   `[Start] ${span.name} ${span.spanContext().spanId} parent = ${span.parentSpanId || ''}`,
    // );
  }

  onEnd(span: ReadableSpan): void {
    this._queue.enqueue(span);
    // console.info(
    //   `[Ennnd] ${span.name} ${span.spanContext().spanId}, runId=${span.attributes['langchain-run-id']}`,
    // );
  }

  async forceFlush() {
    await this._queue.destroy();
    await this._exporter.forceFlush();
  }

  async shutdown() {
    await this._queue.destroy();
    await this._exporter.shutdown();
  }
}
