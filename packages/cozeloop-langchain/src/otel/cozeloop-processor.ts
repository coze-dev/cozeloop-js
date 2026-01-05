// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { type Context } from '@opentelemetry/api';

import { type CozeloopSpanExporterOptions } from './schema';
import { CozeloopSpanExporter } from './cozeloop-exporter';

export class CozeloopSpanProcessor implements SpanProcessor {
  private _exporters = new Map<string, CozeloopSpanExporter>();

  onStart(span: Span, parentContext: Context): void {
    // no-op
    // console.info(
    //   `[Start] ${span.name} ${span.spanContext().spanId} parent = ${span.parentSpanId || ''}`,
    // );
  }

  onEnd(span: ReadableSpan): void {
    // enqueue spans filter by name
    const exporter = this._exporters.get(span.instrumentationLibrary.name);
    exporter?.enqueue(span);
    // console.info(
    //   `[Ennnd] ${span.name} ${span.spanContext().spanId}, runId=${span.attributes['langchain-run-id']}`,
    // );
  }

  addExporter(name: string, options: CozeloopSpanExporterOptions) {
    const exporter = new CozeloopSpanExporter(options);

    this._exporters.set(name, exporter);

    return exporter;
  }

  async flushExporter(name: string) {
    const exporter = this._exporters.get(name);

    if (!exporter) {
      return;
    }

    await exporter.flush();
  }

  async removeExporter(name: string) {
    await this.flushExporter(name);

    this._exporters.delete(name);
  }

  async forceFlush() {
    const exporters = Array.from(this._exporters.values());

    await Promise.allSettled(exporters.map(it => it.flush()));
  }

  async shutdown() {
    const exporters = Array.from(this._exporters.values());

    await Promise.allSettled(exporters.map(it => it.shutdown()));

    this._exporters.clear();
  }
}
