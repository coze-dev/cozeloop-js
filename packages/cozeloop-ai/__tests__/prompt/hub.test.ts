// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupPromptHubMock } from '../mock/prompt-hub';
import { PromptCache } from '../../src/prompt/cache';
import { PromptHub, type PromptVariables } from '../../src/prompt';
import { PromptApi, type Message } from '../../src/api';

describe('Test Prompt Hub', () => {
  const httpMock = setupPromptHubMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  afterEach(() => httpMock.reset());

  it.only('#1 getPrompt and formatPrompt', async () => {
    const hub = new PromptHub({
      workspaceId: '7483714249005793292',
      apiClient: {
        baseURL: 'https://api.coze.cn',
      },
      traceable: true,
    });

    const key = 'loop';
    const version = '0.0.2';
    const prompt = await hub.getPrompt(key, version);

    expect(prompt?.prompt_key).toBe(key);
    expect(prompt?.version).toBe(version);

    // 1) format prompt without variables
    (() => {
      const messages = hub.formatPrompt(prompt);

      expect(messages.length + 1).toBe(prompt?.prompt_template.messages.length);
      expect(messages[0].content).contains('{{var1}}');
      expect(messages[1].content).contains('{{var2}}');
    })();

    // 2) format prompt with:
    // var1: str
    // placeholder: messages
    (() => {
      const placeholderMessages: Message[] = [
        { role: 'assistant', content: 'fake_content' },
        { role: 'user', content: 'fake_content' },
      ];
      const variables: PromptVariables = {
        var1: 'value_of_var1',
        placeholder: placeholderMessages,
      };
      const messages = hub.formatPrompt(prompt, variables);

      expect(messages[0].content).contains(variables.var1);
      expect(messages[1].content).contains('{{var2}}');
      expect(messages.length).toBe(
        (prompt?.prompt_template.messages.length || 0) +
          placeholderMessages.length -
          1,
      );
    })();

    // 3) format prompt with:
    // var1: ''
    // var2: str
    (() => {
      const variables: PromptVariables = {
        var1: '',
        var2: 'value_of_var2',
      };
      const messages = hub.formatPrompt(prompt, variables);

      expect(messages[0].content.includes('{{var1}}')).toBe(false);
      expect(messages[1].content).contains(variables.var2);
    })();
  });

  it('#2 prompt hub cache', async () => {
    // refresh in 2000 ms
    const refreshInterval = 200;
    const cache = new PromptCache({ refreshInterval }, new PromptApi({}));
    const spy = vi
      .spyOn(cache, 'pollingUpdate')
      .mockImplementation(() => Promise.resolve());
    vi.useFakeTimers();
    cache.startPollingUpdate('12345');
    // mock 4 times
    await vi.advanceTimersByTimeAsync(refreshInterval);
    await vi.advanceTimersByTimeAsync(refreshInterval);
    await vi.advanceTimersByTimeAsync(refreshInterval);
    await vi.advanceTimersByTimeAsync(refreshInterval);
    expect(spy).toHaveBeenCalledTimes(4);

    vi.useRealTimers();
    expect(cache.get('non_exist_key')).toBeUndefined();
    expect(cache.delete('non_exist_key')).toBe(false);

    cache.clear();
    // @ts-expect-error skip
    expect(cache._timer).toBeUndefined();
  });
});
