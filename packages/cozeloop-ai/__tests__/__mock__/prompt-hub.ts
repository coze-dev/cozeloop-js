// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupServer } from 'msw/node';
import { http } from 'msw';

import { setupMockServer, successResp } from './utils';

const normalPrompt = {
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
          content: '你是一个无所不知的机器人，请认真回答用户问题{{var1}}',
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
};

const jinja2Prompt = {
  query: { prompt_key: 'loop12', version: '0.0.3' },
  prompt: {
    workspace_id: '7308703665823416358',
    prompt_key: 'loop12',
    version: '0.0.3',
    prompt_template: {
      variable_defs: [
        { key: 'p', desc: '', type: 'placeholder' },
        { key: 'pl', desc: '', type: 'placeholder' },
      ],
      template_type: 'jinja2',
      messages: [
        {
          role: 'system',
          content:
            '{# 注释：这是一个 Jinja2 模板示例 #}\n标题: {{ title | default("默认标题") }}\n\n{%- if user.is_authenticated %}\n你好, {{ user.name }}!\n{%- else %}\n请登录。\n{%- endif %}\n\n项目列表:\n{%- for item in items %}\n  - {{ loop.index }}: {{ item.name | upper }}\n{%- else %}\n  - 暂无项目。\n{%- endfor %}\n\n原始HTML: {{ "<strong>不转义</strong>" | safe }}\n\n{# 定义一个宏 #}\n{% macro greet(person) %}\nHello, {{ person }}!\n{% endmacro %}\n{{ greet(user.name) }}\n\n项目总数: {{ items | length }}',
        },
        { role: 'placeholder', content: 'pl' },
      ],
    },
    llm_config: { temperature: 1, max_tokens: 4096, top_p: 0.7 },
  },
};

export function setupPromptHubMock() {
  const mockServer = setupServer(
    http.post(/\/v1\/loop\/prompts\/mget/, req => {
      const templateType = req.request.headers.get('x-template-type');
      return successResp({
        items: [templateType === 'jinja2' ? jinja2Prompt : normalPrompt],
      });
    }),
  );

  return setupMockServer(mockServer);
}
