/* eslint-disable max-len -- skip */
import assert from 'node:assert';

import { type Message, type PromptVariables, PromptHub } from '@cozeloop/ai';

export async function run() {
  const hub = new PromptHub({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'api_base_url',
      // token: 'your_api_token',
    },
  });

  // 1. getPrompt
  const key = 'loop12';
  const version = '0.0.3';
  const prompt = await hub.getPrompt(key, version);
  // {
  //   workspace_id: '7308703665823416358',
  //   prompt_key: 'loop12',
  //   version: '0.0.3',
  //   prompt_template: {
  //     template_type: 'normal',
  // messages: [
  //   {
  //     role: 'system',
  //     content:
  //       '{# 注释：这是一个 Jinja2 模板示例 #}\n标题: {{ title | default("默认标题") }}\n\n{%- if user.is_authenticated %}\n你好, {{ user.name }}!\n{%- else %}\n请登录。\n{%- endif %}\n\n项目列表:\n{%- for item in items %}\n  - {{ loop.index }}: {{ item.name | upper }}\n{%- else %}\n  - 暂无项目。\n{%- endfor %}\n\n原始HTML: {{ "<strong>不转义</strong>" | safe }}\n\n{# 定义一个宏 #}\n{% macro greet(person) %}\nHello, {{ person }}!\n{% endmacro %}\n{{ greet(user.name) }}\n\n项目总数: {{ items | length }}',
  //   },
  //   { role: 'placeholder', content: 'pl' },
  // ],
  //   },
  //   llm_config: { max_tokens: 1000, top_p: 1, temperature: 0.7 },
  //   tools: [],
  // }

  assert.strictEqual(prompt?.prompt_key, key);
  assert.strictEqual(prompt.version, version);

  // 2. formatPrompt with variables
  const placeholderMessages: Message[] = [
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'Hello!' },
  ];
  const variables: PromptVariables = {
    title: '示例标题',
    user: {
      is_authenticated: true,
      name: '张三',
    },
    items: [{ name: '项目一' }, { name: '项目二' }, { name: '项目三' }],
    pl: placeholderMessages,
  };
  const messages = hub.formatPrompt(prompt, variables);
  // [
  //   {
  //     role: 'system',
  //     content:
  //       '\n标题: 示例标题\n你好, 张三!\n\n项目列表:\n  - 1: 项目一\n  - 2: 项目二\n  - 3: 项目三\n\n原始HTML: <strong>不转义</strong>\n\n\n\n\nHello, 张三!\n\n\n项目总数: 3',
  //   },
  //   { role: 'assistant', content: 'Hello!' },
  //   { role: 'user', content: 'Hello!' },
  // ];

  assert.ok(messages.length);
}
