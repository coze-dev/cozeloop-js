// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type Context,
  type TextMapGetter,
  type TextMapSetter,
  type Span,
  type SpanContext,
  propagation,
} from '@opentelemetry/api';

import { COZELOOP_TRACE_PROPAGATION_HEADERS } from '../../constants';

export const cozeLoopSetter: TextMapSetter = {
  set(carrier, key, value) {
    if (!carrier || typeof carrier !== 'object') {
      return;
    }

    let targetKey = key;
    if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACEPARENT) {
      targetKey = COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT;
    } else if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACESTATE) {
      targetKey = COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE;
    }

    carrier[targetKey] = value;
  },
};

export const cozeLoopGetter: TextMapGetter = {
  get(carrier, key) {
    if (!carrier || typeof carrier !== 'object') {
      return undefined;
    }

    if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACEPARENT) {
      return (
        carrier[COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT] ??
        carrier[
          COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT.toLowerCase()
        ]
      );
    } else if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACESTATE) {
      return (
        carrier[COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE] ??
        carrier[
          COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE.toLowerCase()
        ]
      );
    }

    return carrier[key];
  },
  keys(carrier) {
    if (!carrier || typeof carrier !== 'object') {
      return [];
    }
    return Object.keys(carrier);
  },
};

export function injectWithCozeLoopHeaders<Carrier>(
  context: Context,
  carrier: Carrier,
): void {
  propagation.inject(context, carrier, cozeLoopSetter);
}

export function extractWithCozeLoopHeaders<Carrier>(
  context: Context,
  carrier: Carrier,
): Context {
  return propagation.extract(context, carrier, cozeLoopGetter);
}

/**
 * 计算 span 的 traceparent 和 tracestate
 *
 * @param span - OpenTelemetry Span 实例
 * @returns 包含 traceparent 和 tracestate 的对象
 */
export function calcSpanTraceHeaders(span: Span) {
  const spanContext = span.spanContext();
  return calcSpanContextTraceHeaders(spanContext);
}

/**
 * 从 SpanContext 计算 traceparent 和 tracestate
 *
 * @param spanContext - OpenTelemetry SpanContext 实例
 * @returns 包含 traceparent 和 tracestate 的对象
 */
export function calcSpanContextTraceHeaders(spanContext: SpanContext) {
  // 构建 traceparent 格式: version-trace_id-parent_id-trace_flags
  // W3C Trace Context 规范: https://www.w3.org/TR/trace-context/
  const version = '00'; // 当前版本固定为 00
  const { traceId } = spanContext;
  const { spanId } = spanContext;
  const traceFlags =
    spanContext.traceFlags?.toString(16).padStart(2, '0') || '01';

  const traceparent = `${version}-${traceId}-${spanId}-${traceFlags}`;

  // 获取 tracestate
  const tracestate = spanContext.traceState?.serialize();

  return {
    [COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACEPARENT]: traceparent,
    [COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT]: traceparent,
    [COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACESTATE]:
      tracestate || undefined,
    [COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE]:
      tracestate || undefined,
  };
}
