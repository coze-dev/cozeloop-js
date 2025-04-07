// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type ReadableSpan,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-node';

import {
  COZELOOP_LOGGER_TRACER_TAG,
  COZELOOP_TRACE_IDENTIFIER,
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

  constructor(options: LoopTraceExporterOptions) {
    const { workspaceId, apiClient, logger } = options;
    super(logger ?? simpleConsoleLogger, COZELOOP_LOGGER_TRACER_TAG);
    this._workspaceId = workspaceId;
    this._loopTraceClient = new CozeLoopTraceClient({
      apiClient,
      workspaceId: this._workspaceId,
      logger,
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
    await this.loopLogger.warn('Shutdown CozeLoopTraceExporter');
  }

  async forceFlush(): Promise<void> {
    await this.loopLogger.warn('Forces to export all finished spans');
  }
}
