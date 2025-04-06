import { setTimeout } from 'node:timers/promises';

import {
  COZELOOP_TRACE_BUSINESS_TAGS,
  cozeLoopTracer,
  type LoopTraceLLMCallInput,
  type LoopTraceLLMCallOutput,
  SpanKind,
} from '@cozeloop/ai';

async function doSomething() {
  await setTimeout(2000, 'result');
}

async function fakeLLMCall(): Promise<LoopTraceLLMCallOutput> {
  return await setTimeout(2000, {
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: "hi, I'm xx model",
        },
      },
    ],
  });
}

export async function runRoot() {
  // We recommend concatenating a complete user request into a trace,
  // so the recommended approach is to report a root span at the entrance of the entire execution
  await cozeLoopTracer.traceable(
    async () => {
      // execute your method
      const result = await doSomething();

      return result;
    },
    {
      name: 'TestRootSpan',
      type: 'RootSpanType',
    },
  );
}

export async function runCustom() {
  // Wrap any function to make it traceable
  await cozeLoopTracer.traceable(
    async parentSpan => {
      // Manually set input
      cozeLoopTracer.setInput(parentSpan, 'xxx');

      // Invoke any function, if it throws error, error will be caught and automatically set span as error
      const result = await doSomething();

      // Or, you can manually set error
      cozeLoopTracer.setError(parentSpan, 'custom error message');

      // You can also trace nested span, the parent-child relationship of span will be automatically concatenated
      await cozeLoopTracer.traceable(
        async childSpan => {
          // Set custom tags
          childSpan.setAttribute('custom-tag', 'xxx');

          await doSomething();
        },
        {
          name: 'TestCustomChildSpan',
          type: 'MyCustomType',
        },
      );

      // Automatically set return value as output
      return result;
    },
    {
      name: 'TestCustomParentSpan',
      type: 'MyCustomType',
    },
  );
}

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
