// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { SpanStatusCode, type Span } from '@opentelemetry/api';

import {
  setError,
  setInput,
  setOutput,
  setTag,
  setTags,
} from '../../src/tracer/utils/tags';
import {
  COZELOOP_TRACE_BUSINESS_TAGS,
  COZELOOP_TRACE_BASIC_TAGS,
  cozeLoopTracer,
} from '../../src';

cozeLoopTracer.initialize();

function spanAttr(span: Span, key: string) {
  // eslint-disable-next-line security/detect-object-injection -- skip
  return (span as unknown as ReadableSpan).attributes[key];
}

function spanStatus(span: Span) {
  return (span as unknown as ReadableSpan).status;
}

const { INPUT_TOKENS, STREAM, CALL_OPTIONS } = COZELOOP_TRACE_BUSINESS_TAGS;
const { SPAN_INPUT, SPAN_OUTPUT } = COZELOOP_TRACE_BASIC_TAGS;

describe('Test utils/tags', () => {
  it('🧪 setTag & setTags', () => {
    cozeLoopTracer.traceable(
      span => {
        const inputTokens = 100;
        const stream = false;
        const callOptions = {
          model: 'doubao',
          headers: { 'x-tt-logid': '123123' },
        };

        setTag(span, INPUT_TOKENS, inputTokens);
        setTags(span, {
          [STREAM]: false,
          [CALL_OPTIONS]: callOptions,
        });

        expect(spanAttr(span, INPUT_TOKENS)).toBe(inputTokens);
        expect(spanAttr(span, STREAM)).toBe(stream);
        expect(spanAttr(span, CALL_OPTIONS)).toBe(JSON.stringify(callOptions));
      },
      { name: 'TestSpan', type: 'setTag & setTags' },
    );
  });

  it('🧪 setInput & setOutput', () => {
    cozeLoopTracer.traceable(
      span => {
        const input = new Date(); // to test Date value
        const output = {
          messages: [{ role: 'assistant', content: 'how can I help you' }],
        };
        setInput(span, input);
        setOutput(span, output);

        expect(spanAttr(span, SPAN_INPUT)).toBe(input.toISOString());
        expect(spanAttr(span, SPAN_OUTPUT)).toBe(JSON.stringify(output));
      },
      { name: 'TestSpan', type: 'setInput & setOutput' },
    );
  });

  it('🧪 setError', () => {
    cozeLoopTracer.traceable(
      span => {
        const errorMessage = 'test error';
        setError(span, errorMessage);

        expect(spanStatus(span).code).toBe(SpanStatusCode.ERROR);
        expect(spanStatus(span).message).toBe(errorMessage);
      },
      { name: 'TestSpan', type: 'setError' },
    );
  });
});
