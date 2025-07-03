// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { TraceState } from '@opentelemetry/core';
import { context, trace } from '@opentelemetry/api';

import {
  extractPropagationHeaders,
  injectPropagationHeaders,
} from '@cozeloop/langchain/otel';

const tracer = trace.getTracer('test');

describe('injectPropagationHeaders', () => {
  it('🧪 should inject propagation headers into the carrier', () => {
    const carrier = {};
    const parent = tracer.startSpan('root');
    const ctx = trace.setSpan(context.active(), parent);
    const spanCtx = trace.getSpanContext(ctx);
    if (spanCtx) {
      spanCtx.traceState = new TraceState().set('q', '1');
    }

    injectPropagationHeaders(ctx, carrier);

    parent.end();

    expect(carrier).toHaveProperty('traceparent');
    expect(carrier).toHaveProperty('tracestate');
    expect(carrier).toHaveProperty('X-Cozeloop-Traceparent');
    expect(carrier).toHaveProperty('X-Cozeloop-Tracestate');
  });
});

describe('extractPropagationHeaders', () => {
  it('🧪 should extract propagation headers from the carrier', () => {
    const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    const spanId = '00f067aa0ba902b7';
    const traceparent = `00-${traceId}-${spanId}-01`;
    const carrier = {
      traceparent,
      tracestate: 'w3c=1',
    };

    const ctx = extractPropagationHeaders(context.active(), carrier);
    const span = tracer.startSpan('test', undefined, ctx);
    const spanCtx = span.spanContext();

    expect((span as unknown as ReadableSpan).parentSpanId).toEqual(spanId);
    expect(spanCtx.traceId).toEqual(traceId);
    expect(spanCtx.traceState?.get('w3c')).toEqual('1');
  });

  it('🧪 should extract propagation headers with priority', () => {
    const traceId1 = '4bf92f3577b34da6a3ce929d0e0e4736';
    const traceId2 = '4bf92f3577b34da6a3ce929d0e0effff';
    const spanId1 = '00f067aa0ba902b8';
    const spanId2 = '00f067aa0ba9ffff';
    const carrier = {
      traceparent: `00-${traceId1}-${spanId1}-01`,
      tracestate: 'w3c=1',
      'X-Cozeloop-Traceparent': `00-${traceId2}-${spanId2}-01`,
      'X-Cozeloop-Tracestate': 'cozeloop=1',
    };

    const ctx = extractPropagationHeaders(context.active(), carrier);
    const span = tracer.startSpan('test', undefined, ctx);
    const spanCtx = span.spanContext();

    expect((span as unknown as ReadableSpan).parentSpanId).toEqual(spanId2);
    expect(spanCtx.traceId).toEqual(traceId2);
    expect(spanCtx.traceState?.get('w3c')).toBeUndefined();
    expect(spanCtx.traceState?.get('cozeloop')).toEqual('1');
  });
});
