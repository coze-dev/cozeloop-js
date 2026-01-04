// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { ChatPromptTemplate } from '@langchain/core/prompts';

import {
  CozeloopCallbackHandler,
  type CozeloopCallbackHandlerInput,
} from '@cozeloop/langchain';
import {
  CustomLLM,
  CustomRetriever,
  reactAgentExecutor,
  graphAgent,
  fanGraph,
  setupTraceMock,
  customAgent,
} from '../__mock__';

const makeCallback = (input?: CozeloopCallbackHandlerInput) =>
  new CozeloopCallbackHandler({ ...input });

describe('Callback with langchain', () => {
  const httpMock = setupTraceMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  afterEach(() => httpMock.reset());

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

    expect(resp).toBeTruthy();
    expect(callback.w3cPropagationHeaders?.traceparent).not.toBeUndefined();
    expect(
      callback.w3cPropagationHeaders?.['X-Cozeloop-Traceparent'],
    ).not.toBeUndefined();

    await callback.flush();
  });

  it('🧪 stream model', async () => {
    const callback = makeCallback();
    const model = new CustomLLM({});
    const resp = await model.stream(['hi', '你好'], {
      callbacks: [callback],
    });

    for await (const chunk of resp) {
      expect(chunk).not.toBeUndefined();
    }

    await callback.flush();
  });

  it('🧪 retriever', async () => {
    const callback = makeCallback();
    const retriever = new CustomRetriever();

    const resp = await retriever.invoke('苹果派做法', {
      callbacks: [callback],
      runName: '🧑‍🍳 烹饪大家',
    });
    expect(resp.length).toBeGreaterThan(1);

    await callback.flush();
  });

  it.skip('🧪 react agent', async () => {
    const callback = makeCallback();
    const resp = await reactAgentExecutor.invoke(
      { input: '翻译「苹果」到英文' },
      { callbacks: [callback] },
    );

    expect(resp).toBeTruthy();

    await callback.flush();
  });
});

describe('Callback with langgraph', () => {
  const httpMock = setupTraceMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  afterEach(() => httpMock.reset());

  it('🧪 simple graph', async () => {
    const callback = makeCallback();
    const resp = await fanGraph.invoke(
      { aggregate: [] },
      { callbacks: [callback] },
    );

    expect(resp.aggregate.length).toBeGreaterThan(0);

    await callback.flush();
  });

  it('🧪 custom llm agent', async () => {
    const callback = makeCallback();
    const resp = await customAgent.invoke(
      {
        messages: [
          {
            role: 'user',
            content: 'what is the weather in sf',
          },
        ],
      },
      { callbacks: [callback] },
    );
    expect(resp.messages.length).toBeGreaterThan(1);

    await callback.flush();
  });

  it.skip('🧪 graph agent', async () => {
    const callback = makeCallback();
    const resp = await graphAgent.invoke(
      {
        messages: [
          {
            role: 'user',
            content: 'what is the weather in sf',
          },
        ],
      },
      { callbacks: [callback] },
    );
    expect(resp.messages.length).toBeGreaterThan(1);

    await callback.flush();
  });
});
