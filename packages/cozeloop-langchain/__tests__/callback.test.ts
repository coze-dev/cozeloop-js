import { ChatPromptTemplate } from '@langchain/core/prompts';

import { reactAgentExecutor } from './__mock__/react-agent';
import { CustomLLM } from './__mock__';
import { CozeloopCallbackHandler } from '../src';

describe('Callback Test', () => {
  it('🧪 invoke model', async () => {
    const prompt = ChatPromptTemplate.fromTemplate('What is 1 + {number}?');
    const model = new CustomLLM({});
    const chain = prompt.pipe(model);
    const callback = new CozeloopCallbackHandler({
      spanProcessor: {
        headers: {
          'x-tt-env': 'boe_otel_ingest_trace',
        },
        traceEndpoint:
          'https://api-bot-boe.bytedance.net/v1/loop/opentelemetry/v1/traces',
      },
      // ignoreAgent: true,
      // ignoreLLM: true,
      // ignorePrompt: true,
      // ignoreChain: true,
      // ignoreCustomEvent: true,
      // ignoreRetriever: true,
      // raiseError: true,
    });

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

  it('🧪 stream model', async () => {
    const callback = new CozeloopCallbackHandler({
      spanProcessor: {
        traceEndpoint:
          'https://api-bot-boe.bytedance.net/v1/loop/opentelemetry/v1/traces',
      },
    });
    const model = new CustomLLM({});
    const resp = await model.stream('123', {
      callbacks: [callback],
    });
    for await (const chunk of resp) {
      console.info('receive', chunk);
    }
    await callback.shutdown();
  });

  it.only('🧪 react agent', async () => {
    const callback = new CozeloopCallbackHandler({
      spanProcessor: {
        traceEndpoint:
          'https://api-bot-boe.bytedance.net/v1/loop/opentelemetry/v1/traces',
        headers: {
          'x-tt-env': 'boe_otel_ingest_trace',
        },
      },
    });
    const resp = await reactAgentExecutor.invoke(
      { input: '翻译「苹果」到英文' },
      { callbacks: [callback] },
    );

    console.info(resp);

    await callback.shutdown();
  });
});
