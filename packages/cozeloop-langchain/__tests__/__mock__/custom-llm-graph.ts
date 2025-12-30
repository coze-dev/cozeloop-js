import { type } from 'arktype';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';

import { CustomChatModel } from './custom-chat-model';

const model = new CustomChatModel({});

const weatherSchema = type({
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
    schema: weatherSchema as any,
  },
);

// We can add our system prompt here
const prompt = 'Respond in Italian';

export const customAgent = createReactAgent({
  llm: model,
  tools: [getWeather],
  stateModifier: prompt,
});
