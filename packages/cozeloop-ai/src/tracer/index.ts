// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { traceable } from './wrapper';
import { tracerInitModule } from './initialize';

export {
  type LoopTraceWrapperOptions,
  type LoopTraceInitializeOptions,
  SpanKind,
} from './types';

export { CozeLoopTraceClient } from './client';
export { CozeLoopTraceExporter } from './exporter';

export { COZELOOP_TRACE_TAGS } from './constants';

/**
 * LoopTracer Object
 */
export const cozeLoopTracer = {
  /**
   * Initialize tracer
   */
  initialize: tracerInitModule.initialize,
  /**
   * Wraps function and report trace
   */
  traceable,
  /**
   * Forces to export all finished spans
   */
  forceFlush: tracerInitModule.forceFlush,
  /**
   * Shutdown tracer
   */
  shutdown: tracerInitModule.shutdown,
};
