// npm install @langchain-anthropic
import { z } from 'zod';
import { AzureChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';

const search = tool(
  ({ query }) => {
    if (
      query.toLowerCase().includes('sf') ||
      query.toLowerCase().includes('san francisco')
    ) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  },
);

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

export const graphAgent = createReactAgent({
  llm: model,
  tools: [search],
});
