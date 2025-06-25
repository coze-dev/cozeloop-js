import { setTimeout } from 'node:timers/promises';

import { GenerationChunk } from '@langchain/core/outputs';
import { LLM } from '@langchain/core/language_models/llms';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';

export class CustomLLM extends LLM {
  readonly delay = 10;
  readonly chunkSize = 2;

  _llmType() {
    return 'custom';
  }

  async _call(
    prompt: string,
    options: this['ParsedCallOptions'],
    runManager: CallbackManagerForLLMRun,
  ): Promise<string> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    return await setTimeout(this.delay, `[MOCK] ${prompt}`);
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<GenerationChunk> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    const fullText = `[MOCK] ${prompt}`;
    for (const letter of fullText.split('')) {
      yield new GenerationChunk({
        text: letter,
      });
      // Trigger the appropriate callback
      await runManager?.handleLLMNewToken(letter);
    }
  }
}
