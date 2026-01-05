import { createAgent, tool } from 'langchain';
import { type as arktype } from 'arktype';

import { CustomChatModel } from './custom-chat-model';

const model = new CustomChatModel({});

const weatherSchema = arktype({
  /** Location to get the weather for. */
  location: "'sf' | 'nyc'",
});

const getWeather = tool(
  (input: typeof weatherSchema.infer) => {
    if (input.location === 'sf') {
      return "It's always sunny in sf";
    } else {
      return 'It might be cloudy in nyc';
    }
  },
  {
    name: 'get_weather',
    description: 'Call to get the current weather.',
    schema: weatherSchema.toJsonSchema(),
  },
);

export const customAgent = createAgent({
  model,
  tools: [getWeather],
  systemPrompt: 'You are a helpful assistant',
});
