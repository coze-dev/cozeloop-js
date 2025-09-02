import assert from 'node:assert';

import { type PromptVariables, PromptHub } from '@cozeloop/ai';

export async function run() {
  const hub = new PromptHub({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'api_base_url',
      // token: 'your_api_token',
    },
  });

  // 1. getPrompt with label
  const key = 'loop';
  const version = undefined;
  const label = 'beta';
  const prompt = await hub.getPrompt(key, version, label);
  // {
  //   workspace_id: '7308703665823416358',
  //   prompt_key: 'loop',
  //   version: '0.0.2',
  //   prompt_template: {
  //     template_type: 'jinja2',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'You are a helpful bot, the conversation topic is {{var1}}.',
  //       },
  //       { role: 'placeholder', content: 'placeholder1' },
  //       { role: 'user', content: 'My question is {{var2}}' },
  //       { role: 'placeholder', content: 'placeholder2' },
  //       { role: 'user', content: '' },
  //     ],
  //     variable_defs: [
  //       { key: 'var1', desc: '', type: 'string' },
  //       { key: 'var2', desc: '', type: 'string' },
  //       { desc: '', type: 'multi_part', key: 'img1' },
  //       { key: 'placeholder1', desc: '', type: 'placeholder' },
  //       { key: 'placeholder2', desc: '', type: 'placeholder' },
  //     ],
  //   },
  //   llm_config: {
  //     temperature: 1,
  //     max_tokens: 4096,
  //     top_p: 0.7,
  //     frequency_penalty: 0,
  //   },
  // }

  assert.strictEqual(prompt?.prompt_key, key);
  assert.strictEqual(prompt.version, '0.0.2');

  // 2. formatPrompt with variables
  const variables: PromptVariables = {
    var1: 'value_of_var1',
    var2: 'value_of_var2',
    var3: 'value_of_var3',
    placeholder1: { role: 'assistant', content: 'user' },
  };
  const messages = hub.formatPrompt(prompt, variables);
  // [
  //   {
  //     role: 'system',
  //     content:
  //       'You are a helpful bot, the conversation topic is value_of_var1.',
  //   },
  //   { role: 'assistant', content: 'user' },
  //   { role: 'user', content: 'My question is value_of_var2' },
  //   { role: 'user', content: '' },
  // ]
  assert.ok(messages.length);
}

run();
