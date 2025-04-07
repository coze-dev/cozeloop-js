import { SpanKind } from '@cozeloop/ai';
import {
  COZELOOP_TRACE_BUSINESS_TAGS,
  cozeLoopTracer,
  type LoopTraceLLMCallInput,
} from '@cozeloop/ai';

import { fakeLLMCall } from './utils';

export async function runModel() {
  // Wrap model invoke function to make it traceable
  await cozeLoopTracer.traceable(
    async span => {
      const input: LoopTraceLLMCallInput = {
        messages: [
          {
            role: 'user',
            content: 'hi',
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'test-tool',
              description: 'tool-description',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
              },
            },
          },
        ],
        tool_choice: {
          type: 'auto',
          function: {
            name: 'test-tool',
          },
        },
      };

      // Manually set input, if the input satisfies the LoopTraceLLMCallInput structure,
      // the results will be better displayed in the CozeLoop platform
      cozeLoopTracer.setInput(span, input);

      // Invoke/stream model
      const result = await fakeLLMCall();

      // Set model related tags
      cozeLoopTracer.setTags(span, {
        [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_NAME]: 'custom-model',
        [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_PROVIDER]: 'cozeloop',
        [COZELOOP_TRACE_BUSINESS_TAGS.CALL_OPTIONS]: {
          temperature: 0.5,
          max_tokens: 1000,
        },
        [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: 100,
        [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: 200,
        [COZELOOP_TRACE_BUSINESS_TAGS.TOKENS]: 300,
        // If you use streaming return, record the microsecond timestamp returned by the first Token,
        // and the SDK will automatically calculate the time spent on the first Token
        [COZELOOP_TRACE_BUSINESS_TAGS.START_TIME_FIRST_RESP]: 1741305600123456,
      });

      // Manually set output, if the output satisfies the LoopTraceLLMCallOutput structure,
      // the results will be better displayed in the CozeLoop platform
      cozeLoopTracer.setOutput(span, result);

      return result.choices;
    },
    {
      name: 'TestModelSpan',
      type: SpanKind.Model,
    },
  );
}
