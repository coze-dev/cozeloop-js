import { createAgent, tool } from 'langchain';
import { type as arktype } from 'arktype';
import { AzureChatOpenAI } from '@langchain/openai';

const searchSchema = arktype({
  /** The query to use in your search. */
  query: 'string',
});

const search = tool(
  (input: typeof searchSchema.infer) => {
    const query = input.query?.toLowerCase() ?? '';
    if (query.includes('sf') || query.includes('san francisco')) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: searchSchema.toJsonSchema() as any,
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

export const graphAgent = createAgent({
  model,
  tools: [search],
});
