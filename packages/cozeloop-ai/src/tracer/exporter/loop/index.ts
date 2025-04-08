// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type SpanProcessor,
  type ReadableSpan,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { context, type Span, trace } from '@opentelemetry/api';

import { type BaggageAttributes } from '../../types/wrapper';
import {
  COZELOOP_LOGGER_TRACER_TAG,
  COZELOOP_TRACE_BUSINESS_TAGS,
  COZELOOP_TRACE_IDENTIFIER,
  COZELOOP_TRACE_SPAN_MESSAGE_ID_KEY,
  COZELOOP_TRACE_SPAN_THREAD_ID_KEY,
  COZELOOP_TRACE_SPAN_USER_ID_KEY,
} from '../../constants';
import { CozeLoopTraceClient } from '../../client';
import {
  LoopLoggable,
  simpleConsoleLogger,
  type SimpleLogger,
} from '../../../utils/logger';
import { type LoopApiClient } from '../../../api/types';

interface LoopTraceExporterOptions {
  /**
   * The CozeLoop API client
   */
  apiClient: LoopApiClient;
  /**
   * CozeLoop workspace ID
   */
  workspaceId: string;
  /**
   * A logger function to print debug message
   */
  logger?: SimpleLogger;
}

export class CozeLoopTraceExporter
  extends LoopLoggable
  implements SpanExporter
{
  protected _workspaceId: string;
  protected _loopTraceClient: CozeLoopTraceClient;
  protected _activeSpanMap: Map<
    string,
    {
      baggageAttributes?: BaggageAttributes;
    }
  >;

  constructor(options: LoopTraceExporterOptions) {
    const { workspaceId, apiClient, logger } = options;
    super(logger ?? simpleConsoleLogger, COZELOOP_LOGGER_TRACER_TAG);
    this._workspaceId = workspaceId;
    this._loopTraceClient = new CozeLoopTraceClient({
      apiClient,
      workspaceId: this._workspaceId,
      logger,
    });
    this._activeSpanMap = new Map();
  }

  private _onStart(
    span: Span,
    parentSpan?: ReadableSpan,
    baggageAttributes?: BaggageAttributes,
  ) {
    const { spanId } = span.spanContext();
    const parentSpanId = parentSpan?.spanContext().spanId;
    const { baggageAttributes: parentBaggageAttributes } =
      this._activeSpanMap.get(parentSpanId ?? '') || {};

    const mergedBaggageAttributes: BaggageAttributes = {
      ...baggageAttributes,
      ...parentBaggageAttributes,
    };

    this._activeSpanMap.set(spanId, {
      baggageAttributes: mergedBaggageAttributes,
    });

    const { userId, messageId, threadId } = mergedBaggageAttributes;

    span.setAttributes({
      [COZELOOP_TRACE_BUSINESS_TAGS.USER_ID]: userId,
      [COZELOOP_TRACE_BUSINESS_TAGS.MESSAGE_ID]: messageId,
      [COZELOOP_TRACE_BUSINESS_TAGS.THREAD_ID]: threadId,
    });
  }

  handleSpanStart(spanProcessor: SpanProcessor) {
    spanProcessor.onStart = (span, parentContext) => {
      const customUserId = context
        .active()
        .getValue(COZELOOP_TRACE_SPAN_USER_ID_KEY) as string | undefined;
      const customMessageId = context
        .active()
        .getValue(COZELOOP_TRACE_SPAN_MESSAGE_ID_KEY) as string | undefined;
      const customThreadId = context
        .active()
        .getValue(COZELOOP_TRACE_SPAN_THREAD_ID_KEY) as string | undefined;

      const parentSpan = trace.getSpan(parentContext) as
        | ReadableSpan
        | undefined;

      const baggageAttributes: BaggageAttributes = {
        userId: customUserId,
        messageId: customMessageId,
        threadId: customThreadId,
      };

      this._onStart(span, parentSpan, baggageAttributes);
    };
  }

  export(spans: ReadableSpan[]): void {
    const cozeLoopSpans = spans.filter(span => {
      const { spanId } = span.spanContext();
      this._activeSpanMap.delete(spanId);
      return (
        span.instrumentationLibrary.name === COZELOOP_TRACE_IDENTIFIER.LOOP
      );
    });

    this._loopTraceClient.endSpans(cozeLoopSpans);
  }

  async shutdown(): Promise<void> {
    this._activeSpanMap.clear();

    await this.loopLogger.warn('Shutdown CozeLoopTraceExporter');
  }

  async forceFlush(): Promise<void> {
    await this.loopLogger.warn('Forces to export all finished spans');
  }
}
