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
  const key = 'loop';
  const version = '0.0.3';
  const prompt = await hub.getPrompt(key, version);
  // {
  //   workspace_id: '7306823955623854124',
  //   prompt_key: 'loop',
  //   version: '0.0.3',
  //   prompt_template: {
  //     template_type: 'normal',
  //     messages: [
  //       {
  //         content: 'You are a helpful bot, the conversation topic is {{var1}}.',
  //         role: 'system',
  //       },
  //       { role: 'placeholder', content: 'placeholder1' },
  //       { role: 'user', content: 'My question is {{var2}}' },
  //       { role: 'placeholder', content: 'placeholder2' },
  //     ],
  //     variable_defs: [
  //       { key: 'var1', desc: '', type: 'string' },
  //       { key: 'var2', desc: '', type: 'string' },
  //       { key: 'placeholder1', desc: '', type: 'placeholder' },
  //       { key: 'placeholder2', desc: '', type: 'placeholder' },
  //     ],
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
    var1: 'Hello!',
    placeholder1: placeholderMessages,
  };
  const messages = hub.formatPrompt(prompt, variables);
  // [
  //   {
  //     role: 'system',
  //     content: 'You are a helpful bot, the conversation topic is Hello!.'
  //   },
  //   { role: 'assistant', content: 'Hello!' },
  //   { role: 'user', content: 'Hello!' },
  //   { role: 'user', content: 'My question is {{var2}}' }
  // ]

  assert.ok(messages.length);
}
