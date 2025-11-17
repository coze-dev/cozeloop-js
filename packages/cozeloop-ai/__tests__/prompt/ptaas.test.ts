// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { setTimeout } from 'node:timers/promises';

import { setupPTaaSMock } from '../__mock__/ptaas';
import { simpleConsoleLogger } from '../../src/utils/logger';
import { cozeLoopTracer, PromptAsAService } from '../../src';

cozeLoopTracer.initialize({
  apiClient: {
    logger: simpleConsoleLogger,
  },
  processor: 'simple',
});

describe('Test Prompt As a Service', () => {
  const httpMock = setupPTaaSMock();
  beforeAll(async () => await httpMock.start());
  afterAll(async () => await httpMock.close());
  afterEach(async () => {
    // httpMock.reset();
    await setTimeout(2_000);
    await cozeLoopTracer.forceFlush();
  });

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
      messages: [{ role: 'user', content: '做一首诗' }],
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
      apiClient: {
        // headers: { 'x-mock': 'toolcall-stream' },
      },
    });

    const replyStream = await model.stream({
      messages: [{ role: 'user', content: '玩一天' }],
      variables: {
        city: '上海',
      },
    });

    for await (const chunk of replyStream) {
      console.info(JSON.stringify(chunk));
    }
  });

  it.only('#4 collectReplyStream with tool call', async () => {
    const model = new PromptAsAService({
      prompt: {
        prompt_key: 'tool',
        version: '0.0.1',
      },
      apiClient: {
        // headers: { 'x-mock': 'toolcall-stream' },
      },
      traceable: true,
    });

    const replyStream = await model.stream({
      messages: [{ role: 'user', content: '规划上海一日游' }],
    });

    for await (const chunk of replyStream) {
      expect(chunk).toBeTruthy();
    }
  });
});
