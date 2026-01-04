// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
/* eslint-disable security/detect-object-injection -- skip */
import {
  cozeLoopGetter,
  cozeLoopSetter,
  extractWithCozeLoopHeaders,
  injectWithCozeLoopHeaders,
  calcSpanTraceHeaders,
  calcSpanContextTraceHeaders,
} from '../../src/tracer/utils/propagation';
import { COZELOOP_TRACE_PROPAGATION_HEADERS } from '../../src/tracer/constants';
import { context, cozeLoopTracer } from '../../src/tracer';

cozeLoopTracer.initialize();

const {
  W3C_TRACEPARENT,
  W3C_TRACESTATE,
  COZELOOP_TRACEPARENT,
  COZELOOP_TRACESTATE,
} = COZELOOP_TRACE_PROPAGATION_HEADERS;

describe('Test utils/propagation', () => {
  describe('🧪 cozeLoopSetter', () => {
    it('should not set value if carrier is not an object', () => {
      const carrier: Record<string, string> | null = null;
      const key = 'test-key';
      const value = 'test-value';

      cozeLoopSetter.set(carrier, key, value);

      expect(carrier).toBeNull();
    });

    it('should set value on carrier with the provided key', () => {
      const carrier: Record<string, string> = {};
      const key = 'test-key';
      const value = 'test-value';

      cozeLoopSetter.set(carrier, key, value);

      expect(carrier[key]).toBe(value);
    });

    it('should set value on carrier with the COZELOOP_TRACEPARENT key if the provided key is W3C_TRACEPARENT', () => {
      const carrier: Record<string, string> = {};
      const key = W3C_TRACEPARENT;
      const value = 'test-value';

      cozeLoopSetter.set(carrier, key, value);

      expect(carrier[COZELOOP_TRACEPARENT]).toBe(value);
    });

    it('should set value on carrier with the COZELOOP_TRACESTATE key if the provided key is W3C_TRACESTATE', () => {
      const carrier: Record<string, string> = {};
      const key = W3C_TRACESTATE;
      const value = 'test-value';

      cozeLoopSetter.set(carrier, key, value);

      expect(carrier[COZELOOP_TRACESTATE]).toBe(value);
    });
  });

  describe('🧪 cozeLoopGetter', () => {
    describe('get', () => {
      it('should return undefined if carrier is not an object', () => {
        expect(cozeLoopGetter.get(null, 'key')).toBeUndefined();
        expect(cozeLoopGetter.get(undefined, 'key')).toBeUndefined();
        expect(cozeLoopGetter.get('string', 'key')).toBeUndefined();
      });

      it('should return the value for the given key', () => {
        const carrier = { key: 'value' };
        expect(cozeLoopGetter.get(carrier, 'key')).toBe('value');
      });

      it('should return the value for W3C_TRACEPARENT key', () => {
        const carrier = {
          [COZELOOP_TRACEPARENT]: 'traceparent',
        };
        expect(cozeLoopGetter.get(carrier, W3C_TRACEPARENT)).toBe(
          'traceparent',
        );
      });

      it('should return the value for W3C_TRACESTATE key', () => {
        const carrier = {
          [COZELOOP_TRACESTATE]: 'tracestate',
        };
        expect(cozeLoopGetter.get(carrier, W3C_TRACESTATE)).toBe('tracestate');
      });

      it('should handle case-insensitive headers', () => {
        const carrier = {
          [COZELOOP_TRACEPARENT.toLowerCase()]: 'traceparent',
          [COZELOOP_TRACESTATE.toLowerCase()]: 'tracestate',
        };
        expect(cozeLoopGetter.get(carrier, W3C_TRACEPARENT)).toBe(
          'traceparent',
        );
        expect(cozeLoopGetter.get(carrier, W3C_TRACESTATE)).toBe('tracestate');
      });
    });

    describe('keys', () => {
      it('should return an empty array if carrier is not an object', () => {
        expect(cozeLoopGetter.keys(null)).toEqual([]);
        expect(cozeLoopGetter.keys(undefined)).toEqual([]);
        expect(cozeLoopGetter.keys('string')).toEqual([]);
      });

      it('should return the keys of the carrier object', () => {
        const carrier = { key1: 'value1', key2: 'value2' };
        expect(cozeLoopGetter.keys(carrier)).toEqual(['key1', 'key2']);
      });
    });
  });

  it('🧪 injectWithCozeLoopHeaders', () => {
    const carrier: Record<string, unknown> = {};

    cozeLoopTracer.traceable(
      () => {
        injectWithCozeLoopHeaders(context.active(), carrier);
      },
      {
        name: 'TestSpan',
        type: 'injectWithCozeLoopHeaders',
        baggages: { user_id: 'uid-123' },
      },
    );

    expect(carrier[COZELOOP_TRACEPARENT]).toBeDefined();
    expect(carrier[COZELOOP_TRACESTATE]).toBe('user_id=uid-123');
  });

  it('🧪 extractWithCozeLoopHeaders', () => {
    const rootTraceId = '424381abf8a57af66f9fc57964bb5881';
    const userId = 'uid-123';
    const extractedContext = extractWithCozeLoopHeaders(context.active(), {
      [COZELOOP_TRACEPARENT]: `00-${rootTraceId}-a2d0f4b97f0c1da7-01`,
      [COZELOOP_TRACESTATE]: `user_id=${userId}`,
    });

    context.with(extractedContext, () =>
      cozeLoopTracer.traceable(
        span => {
          const { traceId, traceState } = span.spanContext();
          expect(traceId).toEqual(rootTraceId);
          expect(traceState?.get('user_id')).toBe(userId);
        },
        { name: 'TestSpan', type: 'extractWithCozeLoopHeaders' },
      ),
    );
  });

  describe('🧪 calcSpanTraceHeaders', () => {
    it('should calculate traceparent and tracestate from span', () => {
      let result: ReturnType<typeof calcSpanTraceHeaders> | undefined;

      cozeLoopTracer.traceable(
        span => {
          result = calcSpanTraceHeaders(span);
        },
        {
          name: 'TestSpan',
          type: 'calcSpanTraceHeaders',
          baggages: { user_id: 'uid-123', session_id: 'session-456' },
        },
      );

      expect(result).toBeDefined();
      expect(result!.traceparent).toMatch(
        /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9a-f]{2}$/,
      );
      expect(result!.tracestate).toContain('user_id=uid-123');
      expect(result!.tracestate).toContain('session_id=session-456');
    });

    it('should handle span without tracestate', () => {
      let result: ReturnType<typeof calcSpanTraceHeaders> | undefined;

      cozeLoopTracer.traceable(
        span => {
          result = calcSpanTraceHeaders(span);
        },
        {
          name: 'TestSpan',
          type: 'calcSpanTraceHeaders',
        },
      );

      expect(result).toBeDefined();
      expect(result!.traceparent).toMatch(
        /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9a-f]{2}$/,
      );
      expect(result!.tracestate).toBeUndefined();
    });
  });

  describe('🧪 calcSpanContextTraceHeaders', () => {
    it('should calculate traceparent and tracestate from span context', () => {
      let result: { traceparent: string; tracestate?: string } | undefined;

      cozeLoopTracer.traceable(
        span => {
          const spanContext = span.spanContext();
          result = calcSpanContextTraceHeaders(spanContext);
        },
        {
          name: 'TestSpan',
          type: 'calcSpanContextTraceHeaders',
          baggages: { user_id: 'uid-789' },
        },
      );

      expect(result).toBeDefined();
      expect(result!.traceparent).toMatch(
        /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9a-f]{2}$/,
      );
      expect(result!.tracestate).toContain('user_id=uid-789');
    });

    it('should handle span context with specific trace flags', () => {
      const rootTraceId = '424381abf8a57af66f9fc57964bb5881';
      const parentSpanId = 'a2d0f4b97f0c1da7';
      const extractedContext = extractWithCozeLoopHeaders(context.active(), {
        [COZELOOP_TRACEPARENT]: `00-${rootTraceId}-${parentSpanId}-01`,
        [COZELOOP_TRACESTATE]: 'user_id=test-user',
      });

      let result: ReturnType<typeof calcSpanContextTraceHeaders> | undefined;

      context.with(extractedContext, () =>
        cozeLoopTracer.traceable(
          span => {
            const spanContext = span.spanContext();
            result = calcSpanContextTraceHeaders(spanContext);
          },
          { name: 'TestSpan', type: 'calcSpanContextTraceHeaders' },
        ),
      );

      expect(result).toBeDefined();
      expect(result!.traceparent).toMatch(
        /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9a-f]{2}$/,
      );
      expect(result!.traceparent).toContain(rootTraceId);
      expect(result!.tracestate).toContain('user_id=test-user');
    });

    it('should format trace flags correctly', () => {
      let result: ReturnType<typeof calcSpanContextTraceHeaders> | undefined;

      cozeLoopTracer.traceable(
        span => {
          const spanContext = span.spanContext();
          result = calcSpanContextTraceHeaders(spanContext);
        },
        {
          name: 'TestSpan',
          type: 'calcSpanContextTraceHeaders',
        },
      );

      expect(result).toBeDefined();
      const parts = result!.traceparent.split('-');
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('00'); // version
      expect(parts[1]).toHaveLength(32); // trace_id
      expect(parts[2]).toHaveLength(16); // span_id
      expect(parts[3]).toMatch(/^[0-9a-f]{2}$/); // trace_flags
    });
  });
});
