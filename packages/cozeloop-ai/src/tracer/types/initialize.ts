// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { type NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import {
  type ContextManager,
  type TextMapPropagator,
} from '@opentelemetry/api';

import { type LoopApiClient } from '../../api/types';

export interface LoopTraceInitializeOptions {
  /**
   * The CozeLoop API client
   */
  apiClient?: LoopApiClient;
  /**
   * CozeLoop workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided
   */
  workspaceId?: string;
  /**
   * Allow ultra long text report
   * If true, the entire content of input and output will be uploaded and reported when exceed the length limit
   */
  ultraLargeReport?: boolean;
  /**
   * Allow input info reporting
   * @default true
   */
  recordInputs?: boolean;
  /**
   * Allow output info reporting
   * @default true
   */
  recordOutputs?: boolean;
  /**
   * The OpenTelemetry SpanExporter to be used for sending traces data
   * @default CozeLoopTraceExporter
   */
  exporter?: SpanExporter;
  /**
   * The OpenTelemetry SpanProcessor to be used for processing traces data
   * @default 'batch'
   */
  processor?: SpanProcessor | 'batch' | 'simple' | 'noop';
  /**
   * The OpenTelemetry Propagator to use
   * Defaults to OpenTelemetry SDK defaults
   */
  propagator?: TextMapPropagator;
  /**
   * The OpenTelemetry ContextManager to use
   * Defaults to OpenTelemetry SDK defaults
   */
  contextManager?: ContextManager;
  /**
   * Extra OpenTelemetry SpanProcessor
   */
  extraProcessors?: SpanProcessor[];
  /**
   * Custom instrumentations
   */
  instrumentations?: NodeSDKConfiguration['instrumentations'];
}
