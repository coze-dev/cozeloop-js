// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { type Span, SpanStatusCode } from '@opentelemetry/api';

import { serializeTagValue } from '../common';
import {
  COZELOOP_LOGGER_TRACER_TAG,
  COZELOOP_TRACE_BASIC_TAGS,
} from '../../constants';
import { type COZELOOP_TRACE_BUSINESS_TAGS } from '../../constants';
import { COZELOOP_LOGGER_TAG } from '../../../utils/logger';

export type BusinessTagValueType<T extends COZELOOP_TRACE_BUSINESS_TAGS> =
  T extends
    | COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS
    | COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS
    | COZELOOP_TRACE_BUSINESS_TAGS.TOKENS
    | COZELOOP_TRACE_BUSINESS_TAGS.REASONING_TOKENS
    | COZELOOP_TRACE_BUSINESS_TAGS.REASONING_DURATION
    | COZELOOP_TRACE_BUSINESS_TAGS.START_TIME_FIRST_RESP
    ? number
    : T extends COZELOOP_TRACE_BUSINESS_TAGS.STREAM
      ? boolean
      : T extends COZELOOP_TRACE_BUSINESS_TAGS.CALL_OPTIONS
        ? Record<string, unknown>
        : string;

export function setTag<T extends COZELOOP_TRACE_BUSINESS_TAGS>(
  span: Span,
  tag: T,
  value: BusinessTagValueType<T>,
): Span {
  span.setAttribute(tag, serializeTagValue(value));
  return span;
}

export function setTags(
  span: Span,
  tags: Partial<{
    [K in COZELOOP_TRACE_BUSINESS_TAGS]: BusinessTagValueType<K>;
  }>,
): Span {
  Object.entries(tags).forEach(([tag, value]) => {
    span.setAttribute(tag, serializeTagValue(value));
  });

  return span;
}

export function setInput<T>(span: Span, value: T): Span {
  span.setAttribute(
    COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT,
    serializeTagValue(value),
  );
  return span;
}

export function setOutput<T>(span: Span, value: T): Span {
  span.setAttribute(
    COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT,
    serializeTagValue(value),
  );
  return span;
}

export function setError(span: Span, errorMessage?: string): Span {
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorMessage,
  });

  const { attributes } = span as unknown as ReadableSpan;

  console.error(
    `[${COZELOOP_LOGGER_TAG}] [${COZELOOP_LOGGER_TRACER_TAG}]
    Business custom function execution error, errorMessage=${errorMessage}, spanName=${
      attributes?.[COZELOOP_TRACE_BASIC_TAGS.SPAN_NAME]
    }, spanType=${attributes?.[COZELOOP_TRACE_BASIC_TAGS.SPAN_TYPE]}, spanId=${
      span.spanContext().spanId
    }, traceId=${span.spanContext().traceId}`,
  );

  return span;
}
