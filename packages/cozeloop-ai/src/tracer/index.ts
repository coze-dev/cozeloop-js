// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { traceable } from './wrapper';
import { setError, setInput, setOutput, setTag, setTags } from './utils/tags';
import { tracerInitModule } from './initialize';

export {
  type LoopTraceWrapperOptions,
  type LoopTraceInitializeOptions,
  SpanKind,
} from './types';

export { CozeLoopTraceClient } from './client';
export { CozeLoopTraceExporter } from './exporter';

export {
  COZELOOP_TRACE_BASIC_TAGS,
  COZELOOP_TRACE_BUSINESS_TAGS,
} from './constants';

export type { Span } from '@opentelemetry/api';

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
   * Set input for span
   */
  setInput,
  /**
   * Set output for span
   */
  setOutput,
  /**
   * Set predefined tag for span
   */
  setTag,
  /**
   * Set multiple predefined tags for span
   */
  setTags,
  /**
   * Set error for span
   */
  setError,
  /**
   * Forces to export all finished spans
   */
  forceFlush: tracerInitModule.forceFlush,
  /**
   * Shutdown tracer
   */
  shutdown: tracerInitModule.shutdown,
};
