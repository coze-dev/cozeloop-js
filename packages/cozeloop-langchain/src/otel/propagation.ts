// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  type Context,
  type TextMapGetter,
  type TextMapSetter,
  propagation,
} from '@opentelemetry/api';

enum CozeloopKey {
  TRACEPARENT = 'X-Cozeloop-Traceparent',
  TRACESTATE = 'X-Cozeloop-Tracestate',
}

enum W3CKey {
  TRACEPARENT = 'traceparent',
  TRACESTATE = 'tracestate',
}

const setter: TextMapSetter = {
  set(carrier, key, value) {
    if (!carrier || typeof carrier !== 'object') {
      return;
    }

    carrier[key] = value;

    // set additional k-v for cozeloop
    switch (key) {
      case W3CKey.TRACEPARENT:
        carrier[CozeloopKey.TRACEPARENT] = value;
        break;
      case W3CKey.TRACESTATE:
        carrier[CozeloopKey.TRACESTATE] = value;
        break;
      default:
        break;
    }
  },
};

const getter: TextMapGetter = {
  get(carrier, key) {
    if (!carrier || typeof carrier !== 'object') {
      return undefined;
    }

    switch (key) {
      case W3CKey.TRACEPARENT:
        return (
          carrier[CozeloopKey.TRACEPARENT] ??
          carrier[CozeloopKey.TRACEPARENT.toLowerCase()] ??
          carrier[W3CKey.TRACEPARENT]
        );
      case W3CKey.TRACESTATE:
        return (
          carrier[CozeloopKey.TRACESTATE] ??
          carrier[CozeloopKey.TRACESTATE.toLowerCase()] ??
          carrier[W3CKey.TRACESTATE]
        );
      default:
        return carrier[`${key}`];
    }
  },
  keys(carrier) {
    if (!carrier || typeof carrier !== 'object') {
      return [];
    }

    return Object.keys(carrier);
  },
};

/**
 * Inject context into a carrier to be propagated inter-process
 * @param context {@link Context}
 * @param carrier any, such as http headers
 */
export function injectPropagationHeaders<T>(context: Context, carrier: T) {
  propagation.inject(context, carrier, setter);
}

/**
 * Extract context from a carrier
 * @param context {@link Context}
 * @param carrier any, such as http headers
 */
export function extractPropagationHeaders<T>(context: Context, carrier: T) {
  return propagation.extract(context, carrier, getter);
}
