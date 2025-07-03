import { setTimeout } from 'node:timers/promises';

import { type Runnable } from '@langchain/core/runnables';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import { AIMessageChunk, type BaseMessage } from '@langchain/core/messages';
import {
  type BaseChatModelCallOptions,
  type BindToolsInput,
  SimpleChatModel,
} from '@langchain/core/language_models/chat_models';
import { type BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { type CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';

export class CustomChatModel extends SimpleChatModel {
  readonly delay = 10;

  _llmType() {
    return 'custom';
  }

  bindTools(
    tools: BindToolsInput[],
    kwargs?: Partial<BaseChatModelCallOptions> | undefined,
  ): Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    BaseChatModelCallOptions
  > {
    return this;
  }

  async _call(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<string> {
    if (!messages.length) {
      throw new Error('No messages provided.');
    }
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    if (typeof messages[0].content !== 'string') {
      throw new Error('Multimodal messages are not supported.');
    }
    return await setTimeout(this.delay, `[MOCK] ${JSON.stringify(messages)}`);
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    if (!messages.length) {
      throw new Error('No messages provided.');
    }
    if (typeof messages[0].content !== 'string') {
      throw new Error('Multimodal messages are not supported.');
    }
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    const fullText = messages.map(it => it.content || '').join(',');
    for (const letter of fullText.split('')) {
      yield new ChatGenerationChunk({
        message: new AIMessageChunk({
          content: letter,
        }),
        text: letter,
      });
      // Trigger the appropriate callback for new chunks
      await runManager?.handleLLMNewToken(letter);
    }
  }
}
