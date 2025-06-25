import { setTimeout } from 'node:timers/promises';

import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { AzureChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';

const translationTool = new DynamicTool({
  name: 'translator',
  description: '将输入的文本翻译成英文',
  func: async (input: string) =>
    await setTimeout(100, `fake translate ${input}`),
});

const tools = [translationTool];

const llm = new AzureChatOpenAI({
  temperature: 0,
  modelName: 'gpt-4o-2024-05-13',
  azureOpenAIApiInstanceName: 'azure-ins',
  azureOpenAIApiDeploymentName: 'azure-dep',
  azureOpenAIEndpoint: process.env.GPT_OPEN_API_BASE_URL,
  azureOpenAIApiVersion: '2024-03-01-preview',
  azureOpenAIApiKey: process.env.GPT_OPEN_API_KEY,
  maxTokens: 1000,
});

const agent = await createOpenAIToolsAgent({
  llm,
  tools,
  prompt: ChatPromptTemplate.fromMessages([
    new SystemMessage('translate user query. {agent_scratchpad}'),
    new MessagesPlaceholder('agent_scratchpad'),
  ]),
});

export const reactAgentExecutor = new AgentExecutor({
  agent,
  tools,
});
