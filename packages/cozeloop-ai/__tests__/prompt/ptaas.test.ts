// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { setupPTaaSMock } from '../__mock__/ptaas';
import { PromptAsAService, type ExecutePromptReply } from '../../src';

describe('Test Prompt As a Service', () => {
  const httpMock = setupPTaaSMock();
  beforeAll(async () => await httpMock.start());
  afterAll(async () => await httpMock.close());
  afterEach(() => httpMock.reset());

  it('#1 basic invoke', async () => {
    const model = new PromptAsAService({
      prompt: {
        prompt_key: 'CozeLoop_Travel_Master',
      },
      traceable: true,
      apiClient: {
        headers: { 'x-mock': 'basic-invoke' },
      },
    });

    const reply = await model.invoke({
      messages: [{ role: 'user', content: '去上海旅游' }],
    });

    expect(reply?.finish_reason).toBe('stop');
    expect(reply?.message.role).toBe('assistant');
  });

  it('#2 basic stream', async () => {
    const model = new PromptAsAService({
      prompt: {
        prompt_key: 'CozeLoop_Travel_Master1',
      },
      apiClient: {
        headers: { 'x-mock': 'basic-stream' },
      },
    });

    const replyStream = await model.stream({
      messages: [{ role: 'user', content: '做一首诗' }],
    });

    for await (const chunk of replyStream) {
      expect(chunk.message).toBeTruthy();
    }
  });

  it('#3 stream with tool call', async () => {
    const model = new PromptAsAService({
      prompt: {
        prompt_key: 'tool',
        version: '0.0.1',
      },
      traceable: true,
      apiClient: {
        headers: { 'x-mock': 'toolcall-stream' },
      },
    });

    let reply: ExecutePromptReply | undefined;
    const replyStream = await model.stream(
      {
        messages: [{ role: 'user', content: '玩一天' }],
        variables: {
          city: '上海',
        },
      },
      res => (reply = res),
    );

    for await (const chunk of replyStream) {
      // console.info(JSON.stringify(chunk));
      expect(chunk.message).toBeTruthy();
    }

    expect(reply?.message.tool_calls?.length).toBeTruthy();
  });
});
