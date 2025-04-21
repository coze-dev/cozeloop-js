import {
  cozeLoopTracer,
  SpanKind,
  type LoopTraceLLMCallInput,
} from '@cozeloop/ai';

import { doSomething } from './utils';

function generateLargeString(sizeInMB: number) {
  const repeats = sizeInMB * 1024 * 1024;
  return 'x'.repeat(repeats);
}

// You can enable the reporting of ultra-long texts by setting
// ultraLargeReport to true when you initialize tracer
export async function runLargeText() {
  await cozeLoopTracer.traceable(
    async span => {
      // Reporting of ultra-long texts will only take effect when the
      // input / output satisfies the LoopTraceLLMCallInput / LoopTraceLLMCallOutput structure
      const input: LoopTraceLLMCallInput = {
        messages: [
          {
            role: 'user',
            content: generateLargeString(2),
          },
        ],
      };

      // Manually set input
      cozeLoopTracer.setInput(span, input);

      // execute your method
      const result = await doSomething();

      return result;
    },
    {
      name: 'TestLargeTextSpan',
      type: SpanKind.Model,
    },
  );
}
