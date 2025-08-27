import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';

import { CustomChatModel } from './custom-chat-model';

const model = new CustomChatModel({});

const getWeather = tool(
  input => {
    if ((input as any).location === 'sf') {
      return "It's always sunny in sf";
    } else {
      return 'It might be cloudy in nyc';
    }
  },
  {
    name: 'get_weather',
    description: 'Call to get the current weather.',
    schema: z.object({
      location: z
        .enum(['sf', 'nyc'])
        .describe('Location to get the weather for.'),
    }),
  },
);

// We can add our system prompt here
const prompt = 'Respond in Italian';

export const customAgent = createReactAgent({
  llm: model,
  tools: [getWeather],
  stateModifier: prompt,
});
