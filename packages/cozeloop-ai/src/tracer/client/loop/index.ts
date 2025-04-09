// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-node';

import { LoopTraceSpanConverter } from '../../utils/client';
import { COZELOOP_LOGGER_TRACER_TAG } from '../../constants';
import {
  LoopLoggable,
  simpleConsoleLogger,
  type SimpleLogger,
} from '../../../utils/logger';
import { type LoopApiClient } from '../../../api/types';
import { TraceApi } from '../../../api';

interface LoopTraceClientInitOptions {
  /**
   * The CozeLoop API client
   */
  apiClient?: LoopApiClient;
  /**
   * CozeLoop workspace ID
   */
  workspaceId: string;
  /**
   * A logger function to print debug message
   */
  logger?: SimpleLogger;
}

export class CozeLoopTraceClient extends LoopLoggable {
  protected _api: TraceApi;
  protected _workspaceId: string;

  constructor(options: LoopTraceClientInitOptions) {
    const { workspaceId, apiClient, logger } = options;
    super(logger ?? simpleConsoleLogger, COZELOOP_LOGGER_TRACER_TAG);
    this._workspaceId = workspaceId;
    this._api = new TraceApi(apiClient);
  }

  endSpans(spans: ReadableSpan[]) {
    try {
      this._api.reportTrace({
        spans: spans.map(span => {
          let converter: LoopTraceSpanConverter | null =
            new LoopTraceSpanConverter({
              span,
              api: this._api,
              workspaceId: this._workspaceId,
            });

          const loopSpan = converter.toLoopSpan();
          converter = null;

          return loopSpan;
        }),
      });
    } catch (error) {
      this.loopLogger.error(
        `Report span error, errorMessage=${error instanceof Error ? error.message : '-'}`,
      );
    }
  }
}
