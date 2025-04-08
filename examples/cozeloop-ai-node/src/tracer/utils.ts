import { setTimeout } from 'node:timers/promises';

import { type LoopTraceLLMCallOutput } from '@cozeloop/ai';

export async function doSomething() {
  await setTimeout(2000, 'result');
}

export async function fakeLLMCall(): Promise<LoopTraceLLMCallOutput> {
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
