// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type Context,
  type TextMapGetter,
  type TextMapSetter,
  propagation,
} from '@opentelemetry/api';

import { COZELOOP_TRACE_PROPAGATION_HEADERS } from '../../constants';

export const cozeLoopSetter: TextMapSetter = {
  set(carrier, key, value) {
    if (!carrier || typeof carrier !== 'object') {
      return;
    }

    let targetKey = key;
    if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACEPARENT) {
      targetKey = COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT;
    } else if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACESTATE) {
      targetKey = COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE;
    }

    carrier[targetKey] = value;
  },
};

export const cozeLoopGetter: TextMapGetter = {
  get(carrier, key) {
    if (!carrier || typeof carrier !== 'object') {
      return undefined;
    }

    if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACEPARENT) {
      return (
        carrier[COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT] ??
        carrier[
          COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACEPARENT.toLowerCase()
        ]
      );
    } else if (key === COZELOOP_TRACE_PROPAGATION_HEADERS.W3C_TRACESTATE) {
      return (
        carrier[COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE] ??
        carrier[
          COZELOOP_TRACE_PROPAGATION_HEADERS.COZELOOP_TRACESTATE.toLowerCase()
        ]
      );
    }

    return carrier[key];
  },
  keys(carrier) {
    if (!carrier || typeof carrier !== 'object') {
      return [];
    }
    return Object.keys(carrier);
  },
};

export function injectWithCozeLoopHeaders<Carrier>(
  context: Context,
  carrier: Carrier,
): void {
  propagation.inject(context, carrier, cozeLoopSetter);
}

export function extractWithCozeLoopHeaders<Carrier>(
  context: Context,
  carrier: Carrier,
): Context {
  return propagation.extract(context, carrier, cozeLoopGetter);
}
