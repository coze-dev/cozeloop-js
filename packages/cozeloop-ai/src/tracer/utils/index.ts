// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  type HrTime,
  type Span,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

import { type SerializedTagValue } from '../types';
import { COZELOOP_TRACE_IDENTIFIER, COZELOOP_TRACE_TAGS } from '../constants';

export function getTracer() {
  return trace.getTracer(COZELOOP_TRACE_IDENTIFIER.LOOP);
}

export function serializeTagValue(value: unknown) {
  if (typeof value === 'object' && value !== null) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return JSON.stringify(value);
  }
  return value as SerializedTagValue;
}

export function reportError(span: Span, errorMessage?: string) {
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorMessage,
  });

  const { attributes } = span as unknown as ReadableSpan;

  console.error(
    `[LoopSDKTracerError]: errorMessage=${errorMessage}, spanName=${
      attributes?.[COZELOOP_TRACE_TAGS.SPAN_NAME]
    }, spanType=${attributes?.[COZELOOP_TRACE_TAGS.SPAN_TYPE]}, spanId=${
      span.spanContext().spanId
    }, traceId=${span.spanContext().traceId}`,
  );
}

export function convertHrTimeToMicroseconds(hrTime: HrTime): number {
  const [seconds, nanoseconds] = hrTime || [];

  const timeInMicroseconds = Math.floor(
    seconds * 1_000_000 + nanoseconds / 1000,
  );

  return timeInMicroseconds;
}

export function safeJSONParse<T>(text: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (error) {
    return defaultValue;
  }
}
