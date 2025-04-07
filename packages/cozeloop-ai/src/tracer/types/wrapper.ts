// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type Attributes } from '@opentelemetry/api';

import { type SpanType } from './index';

export interface LoopTraceWrapperOptions {
  /**
   * The name of the span
   */
  name: string;
  /**
   * The type of the span
   */
  type: SpanType;
  /**
   * Business custom user id, after setting up, the child span will automatically inherit this attribute
   */
  userId?: string;
  /**
   * Business custom message id, after setting up, the child span will automatically inherit this attribute
   */
  messageId?: string;
  /**
   * Business custom thread id, after setting up, the child span will automatically inherit this attribute
   */
  threadId?: string;
  /**
   * Any tag that needs to be reported
   */
  attributes?: Attributes;
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
   * Controls whether spans created in the current active context will be collected and reported
   */
  disableTracing?: boolean;
  /**
   * End span when the method is executed or an error is caught
   * @default true
   */
  endWhenDone?: boolean;
}

export type BaggageAttributes = Pick<
  LoopTraceWrapperOptions,
  'userId' | 'messageId' | 'threadId'
>;
