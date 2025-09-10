// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { setupPTaaSMock } from '../__mock__/ptaas';
import { PromptAsAService } from '../../src';

describe('Test Prompt As a Service', () => {
  const httpMock = setupPTaaSMock();
  beforeAll(async () => {
    await httpMock.start();
  });
  afterAll(async () => {
    await httpMock.close();
  });
  afterEach(() => httpMock.reset());

  it('#1 basic invoke', async () => {
    const model = new PromptAsAService({
      prompt: {
        prompt_key: 'CozeLoop_Travel_Master',
      },
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
});
