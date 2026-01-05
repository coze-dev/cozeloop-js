import { setTimeout } from 'node:timers/promises';

import { createAgent } from 'langchain';
import { AzureChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';

const translationTool = new DynamicTool({
  name: 'translator',
  description: '将输入的文本翻译成英文',
  func: async (input: string) =>
    await setTimeout(100, `fake translate ${input}`),
});

const tools = [translationTool];

const model = new AzureChatOpenAI({
  temperature: 0,
  modelName: 'gpt-4o-2024-05-13',
  azureOpenAIApiInstanceName: 'azure-ins',
  azureOpenAIApiDeploymentName: 'azure-dep',
  azureOpenAIEndpoint: process.env.GPT_OPEN_API_BASE_URL,
  azureOpenAIApiVersion: '2024-03-01-preview',
  azureOpenAIApiKey: process.env.GPT_OPEN_API_KEY,
  maxTokens: 1000,
});

export const reactAgent = await createAgent({
  model,
  tools,
  systemPrompt: 'translate user query. {agent_scratchpad}',
});
