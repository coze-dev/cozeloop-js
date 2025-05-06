// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  BatchSpanProcessor,
  NoopSpanProcessor,
  SimpleSpanProcessor,
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

import { COZELOOP_LOGGER_TAG } from '../utils/logger';
import { ensureProperty, EnvKeys } from '../utils/env';
import { type LoopTraceInitializeOptions } from './types';
import { CozeLoopTraceExporter } from './exporter';
import {
  COZELOOP_LOGGER_TRACER_TAG,
  COZELOOP_MAX_EXPORT_BATCH_SIZE,
  COZELOOP_TRACE_OPTIONS,
} from './constants';

function instantiateProcessor(
  processor: LoopTraceInitializeOptions['processor'],
  exporter: SpanExporter,
) {
  switch (processor) {
    case 'batch':
    case undefined:
      return new BatchSpanProcessor(exporter, {
        maxExportBatchSize: COZELOOP_MAX_EXPORT_BATCH_SIZE,
      });
    case 'noop':
      return new NoopSpanProcessor();
    case 'simple':
      return new SimpleSpanProcessor(exporter);
    default:
      return processor;
  }
}

export const tracerInitModule = (function () {
  let _configuration: LoopTraceInitializeOptions | undefined;
  let _tracer: NodeSDK | undefined;
  let _spanProcessor: SpanProcessor | undefined;

  function initialize(options: LoopTraceInitializeOptions = {}) {
    if (_tracer) {
      return;
    }

    _configuration = Object.freeze(options);

    const workspaceId = ensureProperty({
      propName: 'workspaceId',
      envKey: EnvKeys.WORKSPACE_ID,
      value: options.workspaceId,
      tag: 'Tracer.initialize',
    });

    const {
      apiClient,
      ultraLargeReport,
      recordInputs = true,
      recordOutputs = true,
      exporter,
      processor = 'batch',
      propagator,
      contextManager,
      extraProcessors,
      instrumentations,
    } = options;

    const traceExporter =
      exporter ?? new CozeLoopTraceExporter({ apiClient, workspaceId });

    _spanProcessor = instantiateProcessor(processor, traceExporter);

    const spanProcessors: SpanProcessor[] = [_spanProcessor];

    if (extraProcessors?.length) {
      spanProcessors.push(...extraProcessors);
    }

    _tracer = new NodeSDK({
      resource: new Resource({
        [COZELOOP_TRACE_OPTIONS.ULTRA_LARGE_REPORT]: ultraLargeReport,
        [COZELOOP_TRACE_OPTIONS.RECORD_INPUTS]: recordInputs,
        [COZELOOP_TRACE_OPTIONS.RECORD_OUTPUTS]: recordOutputs,
      }),
      spanProcessors,
      contextManager,
      textMapPropagator: propagator ?? new W3CTraceContextPropagator(),
      traceExporter,
      instrumentations,
    });

    _tracer.start();
  }

  function forceFlush() {
    console.info(
      `[${COZELOOP_LOGGER_TAG}] [${COZELOOP_LOGGER_TRACER_TAG}] Forces to export all finished spans`,
    );
    _spanProcessor?.forceFlush();
  }

  function shutdown() {
    forceFlush();
    _tracer?.shutdown();
  }

  return {
    _configuration,
    initialize,
    forceFlush,
    shutdown,
  };
})();
