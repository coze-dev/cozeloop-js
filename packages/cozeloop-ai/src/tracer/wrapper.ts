// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { randomBytes } from 'node:crypto';

import { type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { suppressTracing, TraceState } from '@opentelemetry/core';
import {
  type Context,
  type Span,
  TraceFlags,
  context,
  trace,
} from '@opentelemetry/api';

import { setError } from './utils/tags';
import { getTracer, serializeTagValue } from './utils';
import { type LoopTraceWrapperOptions } from './types';
import { COZELOOP_TRACE_OPTIONS, COZELOOP_TRACE_BASIC_TAGS } from './constants';

function isAsyncFunc<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
) {
  // @ts-expect-error this is a valid property
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function reportTraceExecuteError({
  span,
  error,
  endWhenDone,
}: {
  span: Span;
  error: unknown;
  endWhenDone: boolean;
}) {
  if (span.isRecording()) {
    setError(span, error instanceof Error ? error.message : undefined);
    if (endWhenDone) {
      span.end();
    }
  }
}

function injectBaggages(
  activeContext: Context,
  baggages: NonNullable<LoopTraceWrapperOptions['baggages']>,
  rootSpanId: string,
): Context {
  const { spanId, traceId, traceFlags, traceState } =
    trace.getSpanContext(activeContext) || {};

  let updatedTraceState = traceState ?? new TraceState();

  for (const [key, value] of Object.entries(baggages)) {
    value && (updatedTraceState = updatedTraceState.set(key, value));
  }

  activeContext = trace.setSpanContext(activeContext, {
    traceId: traceId || randomBytes(16).toString('hex'),
    spanId: spanId || rootSpanId,
    traceFlags: traceFlags || TraceFlags.SAMPLED,
    traceState: updatedTraceState,
  });

  return activeContext;
}

// eslint-disable-next-line max-lines-per-function
function traceData<F extends (...args: Parameters<F>) => ReturnType<F>>(
  options: LoopTraceWrapperOptions,
  fn: F,
  ...args: Parameters<F> | []
): ReturnType<F> {
  const {
    name,
    type,
    baggages,
    disableTracing,
    attributes,
    ultraLargeReport,
    recordInputs = true,
    recordOutputs = true,
    endWhenDone = true,
  } = options;

  let activeContext = context.active();

  disableTracing && (activeContext = suppressTracing(context.active()));

  let customRootSpanId: string | undefined;

  if (baggages) {
    customRootSpanId = randomBytes(8).toString('hex');
    activeContext = injectBaggages(activeContext, baggages, customRootSpanId);
  }

  // eslint-disable-next-line max-lines-per-function
  return context.with(activeContext, () =>
    getTracer().startActiveSpan(
      `${name}.${type}`,
      {
        attributes: {
          [COZELOOP_TRACE_BASIC_TAGS.SPAN_NAME]: name,
          [COZELOOP_TRACE_BASIC_TAGS.SPAN_TYPE]: type,
        },
      },
      activeContext,
      (span: Span) => {
        customRootSpanId &&
          span.setAttribute(
            COZELOOP_TRACE_BASIC_TAGS.SPAN_CUSTOM_ROOT_SPAN_ID,
            customRootSpanId,
          );

        const collectAttributes = (result: ReturnType<F>) => {
          if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
              span.setAttribute(key, serializeTagValue(value));
            }
          }

          const { resource, attributes: spanAttributes } =
            span as unknown as ReadableSpan;

          const globalUltraLargeReport = resource.attributes[
            COZELOOP_TRACE_OPTIONS.ULTRA_LARGE_REPORT
          ] as boolean | undefined;

          const globalRecordInputs = resource.attributes[
            COZELOOP_TRACE_OPTIONS.RECORD_INPUTS
          ] as boolean;

          const globalRecordOutputs = resource.attributes[
            COZELOOP_TRACE_OPTIONS.RECORD_OUTPUTS
          ] as boolean;

          span.setAttribute(
            COZELOOP_TRACE_BASIC_TAGS.SPAN_ULTRA_LARGE_REPORT,
            ultraLargeReport ?? globalUltraLargeReport ?? false,
          );

          const customInput =
            spanAttributes[COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT];

          if (customInput) {
            span.setAttribute(
              COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT,
              serializeTagValue(customInput),
            );
          } else if (globalRecordInputs && recordInputs) {
            span.setAttribute(
              COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT,
              serializeTagValue(args),
            );
          }

          const customOutput =
            spanAttributes[COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT];

          if (customOutput) {
            span.setAttribute(
              COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT,
              serializeTagValue(customOutput),
            );
          } else if (globalRecordOutputs && recordOutputs) {
            span.setAttribute(
              COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT,
              serializeTagValue(result),
            );
          }

          if (endWhenDone && span.isRecording()) {
            span.end();
          }
        };

        if (isAsyncFunc(fn)) {
          return (
            fn.apply(undefined, [...args, span] as Parameters<F>) as Promise<
              Awaited<ReturnType<F>>
            >
          )
            .then(resolve => {
              if (!span.isRecording()) {
                return resolve;
              }
              collectAttributes(resolve);
              return resolve;
            })
            .catch(error => {
              reportTraceExecuteError({
                span,
                error,
                endWhenDone,
              });
              throw error;
            }) as ReturnType<F>;
        } else {
          try {
            const res = fn.apply(undefined, [
              ...args,
              span,
            ] as Parameters<F>) as ReturnType<F>;

            if (!span.isRecording()) {
              return res;
            }

            collectAttributes(res);
            return res;
          } catch (error) {
            reportTraceExecuteError({
              span,
              error,
              endWhenDone,
            });
            throw error;
          }
        }
      },
    ),
  );
}

export function traceable<F extends (span: Span) => ReturnType<F>>(
  /**
   * To avoid 'this' binding problem, in most cases, you should use the arrow function expressions
   */
  fn: F,
  options: LoopTraceWrapperOptions,
): ReturnType<F> {
  return traceData(options, fn);
}
