import assert from 'node:assert';

import { PromptAsAService } from '@cozeloop/ai';

async function runWithNormal() {
  const model = new PromptAsAService({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'api_base_url',
      // token: 'your_api_token',
    },
    prompt: {
      prompt_key: 'CozeLoop_Travel_Master',
      version: '0.0.2',
    },
  });

  // 1. model.invoke
  const reply = await model.invoke({
    messages: [{ role: 'user', content: '帮我规划轻松旅行' }],
    variables: {
      departure: '北京',
      destination: '上海',
      people_num: 2,
      days_num: 1,
      travel_theme: '亲子',
    },
  });

  assert(reply?.message);
  assert(reply.usage);
  assert.strictEqual(reply.finish_reason, 'stop');

  // 2. model.stream
  const replyStream = await model.stream({
    messages: [{ role: 'user', content: '帮我规划轻松旅行' }],
    variables: {
      departure: '北京',
      destination: '上海',
      people_num: 2,
      days_num: 1,
      travel_theme: '亲子',
    },
  });

  for await (const chunk of replyStream) {
    assert(chunk);
  }
}

async function runWithJinja() {
  const model = new PromptAsAService({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'api_base_url',
      // token: 'your_api_token',
    },
    prompt: {
      prompt_key: 'loop12',
      version: '0.0.5',
    },
  });

  // 1. model.invoke
  const reply = await model.invoke({
    messages: [{ role: 'user', content: '总结模板内容' }],
    variables: {
      title: 'Title',
      user: {
        is_authenticated: false,
        name: 'Loop',
      },
      items: [{ name: 'fish' }],
      place: [{ role: 'assistant', content: '好的' }],
    },
  });

  assert(reply?.message);
  assert(reply.usage);
  assert.strictEqual(reply.finish_reason, 'stop');
}

async function runWithMultiPart() {
  const model = new PromptAsAService({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'api_base_url',
      // token: 'your_api_token',
    },
    prompt: {
      prompt_key: 'loop',
      version: '0.0.3',
    },
  });

  const replyStream = await model.stream({
    messages: [{ role: 'user', content: 'respond in 50 words' }],
    variables: {
      var1: 'sports',
      placeholder1: { role: 'assistant', content: 'go on' },
      var2: 'how to play football',
      img1: [
        { type: 'text', text: 'text1' },
        {
          type: 'image_url',
          image_url: {
            url: 'https://tinypng.com/static/images/george-anim/large_george_x2.webp',
          },
        },
      ],
    },
  });

  for await (const chunk of replyStream) {
    assert(chunk);
  }
}

export async function run() {
  await Promise.all([
    runWithNormal(), // 普通模板
    runWithJinja(), // Jinja2 模板
    runWithMultiPart(), // 多模态变量
  ]);

  process.exit();
}

run();
