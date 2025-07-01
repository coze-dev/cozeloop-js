import { ChatPromptTemplate } from '@langchain/core/prompts';

import {
  CozeloopCallbackHandler,
  type CozeloopCallbackHandlerInput,
} from '@cozeloop/langchain';
import { CustomLLM, CustomRetriever, reactAgentExecutor } from './__mock__';

const makeCallback = (input?: CozeloopCallbackHandlerInput) =>
  new CozeloopCallbackHandler({
    spanProcessor: {
      traceEndpoint:
        'https://api-bot-boe.bytedance.net/v1/loop/opentelemetry/v1/traces',
      headers: {
        'x-tt-env': 'boe_otel_ingest_trace',
      },
    },
    ...input,
  });

describe('Callback Test', () => {
  it('🧪 invoke model', async () => {
    const prompt = ChatPromptTemplate.fromTemplate('What is 1 + {number}?');
    const model = new CustomLLM({});
    const chain = prompt.pipe(model);
    const callback = makeCallback();

    const resp = await chain.invoke(
      { number: 1 },
      {
        runName: 'SuperChain',
        callbacks: [callback],
      },
    );
    console.info(resp);
    // to ensure report success
    await callback.shutdown();
  });

  it.only('🧪 stream model', async () => {
    const callback = makeCallback();
    const model = new CustomLLM({});
    const resp = await model.stream(['hi', '你好'], {
      callbacks: [callback],
    });
    for await (const chunk of resp) {
      expect(chunk).not.toBeUndefined();
    }
    await callback.shutdown();
  });

  it('🧪 react agent', async () => {
    const callback = makeCallback();
    const resp = await reactAgentExecutor.invoke(
      { input: '翻译「苹果」到英文' },
      { callbacks: [callback] },
    );

    console.info(resp);

    await callback.shutdown();
  });

  it('🧪 retriever', async () => {
    const callback = makeCallback();
    const retriever = new CustomRetriever();

    const resp = await retriever.invoke('苹果派做法', {
      callbacks: [callback],
      runName: '🧑‍🍳 烹饪大家',
    });
    console.info(resp);

    await callback.shutdown();
  });
});
