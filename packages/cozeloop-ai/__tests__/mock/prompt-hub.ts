// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupServer } from 'msw/node';
import { http } from 'msw';

import { setupMockServer, successResp } from './utils';

export function setupPromptHubMock() {
  const mockServer = setupServer(
    http.post(/\/v1\/loop\/prompts\/mget/, () =>
      successResp({
        items: [
          {
            query: { prompt_key: 'loop1', version: '0.0.2' },
            prompt: {
              llm_config: {
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
              },
              workspace_id: '7306823955623854124',
              prompt_key: 'loop1',
              version: '0.0.2',
              prompt_template: {
                template_type: 'normal',
                messages: [
                  {
                    role: 'system',
                    content:
                      '你是一个无所不知的机器人，请认真回答用户问题{{var1}}',
                  },
                  { role: 'user', content: '用户问题是{{var2}}' },
                  { role: 'placeholder', content: 'placeholder' },
                ],
                variable_defs: [
                  { key: 'var1', desc: '', type: 'string' },
                  { key: 'var2', desc: '', type: 'string' },
                  { desc: '', type: 'placeholder', key: 'placeholder' },
                ],
              },
              tools: [],
            },
          },
        ],
      }),
    ),
  );

  return setupMockServer(mockServer);
}
