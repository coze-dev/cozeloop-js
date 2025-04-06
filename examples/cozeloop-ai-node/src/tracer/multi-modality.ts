import { setTimeout } from 'node:timers/promises';

import {
  cozeLoopTracer,
  SpanKind,
  type LoopTraceLLMCallInput,
} from '@cozeloop/ai';

async function doSomething() {
  await setTimeout(2000, 'result');
}

export async function runMultiModality() {
  await cozeLoopTracer.traceable(
    async span => {
      // Reporting of multi modality will only take effect when the
      // input satisfies the LoopTraceLLMCallInput structure
      const input: LoopTraceLLMCallInput = {
        messages: [
          {
            role: 'user',
            content: '',
            parts: [
              // current support base64 encoded image and file
              {
                type: 'image_url',
                image_url: {
                  url: 'data:image/png;base64,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',
                },
              },
              {
                type: 'file_url',
                file_url: {
                  name: 'test.txt',
                  url: 'data:text/plain;base64,dGVzdCB0ZXN0IHRlc3QK',
                },
              },
            ],
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
      name: 'TestMultiModalitySpan',
      type: SpanKind.Model,
    },
  );
}
