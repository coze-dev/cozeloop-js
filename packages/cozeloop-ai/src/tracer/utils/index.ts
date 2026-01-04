// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { trace } from '@opentelemetry/api';

import { COZELOOP_TRACE_IDENTIFIER } from '../constants';

export function getTracer() {
  return trace.getTracer(COZELOOP_TRACE_IDENTIFIER.LOOP);
}

export {
  safeJSONParse,
  convertHrTimeToMicroseconds,
  serializeTagValue,
} from './common';
