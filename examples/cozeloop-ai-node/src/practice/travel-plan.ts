import { type ChatCompletionCreateParams } from 'openai/resources/chat';
import { OpenAI } from 'openai';
import { cozeLoopTracer, PromptHub, SpanKind } from '@cozeloop/ai';

// initialize tracer globally
cozeLoopTracer.initialize({
  apiClient: {
    // baseURL: 'https://api.coze.cn',
    // token: 'your_api_token',
  },
  processor: 'simple',
});

async function callLLM(messages: ChatCompletionCreateParams['messages']) {
  // config your model
  const apiKey = process.env.GPT_OPEN_API_KEY;
  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.GPT_OPEN_API_BASE_URL,
    defaultQuery: { 'api-version': '2024-03-01-preview' },
    defaultHeaders: { 'api-key': apiKey },
  });

  // wrap model as a span node with `cozeLoopTracer.traceable`
  return await cozeLoopTracer.traceable(
    async span => {
      cozeLoopTracer.setInput(span, { messages });

      const resp = await openai.chat.completions.create({
        model: 'gpt-4-0613',
        messages,
      });

      return resp;
    },
    // span name and type
    { name: 'CallLLM', type: SpanKind.Model },
  );
}

interface TravelPlanOptions {
  departure: string;
  destination: string;
  people_num: number;
  days_num: number;
  travel_theme: string;
}

async function runTravelPlan(options: TravelPlanOptions) {
  // initialize traceable PromptHub
  const hub = new PromptHub({
    apiClient: {
      // baseURL: 'https://api.coze.cn',
      // token: 'your_api_token',
    },
    traceable: true,
  });

  // get prompt
  const promptKey = 'CozeLoop_Travel_Master';
  const prompt = await hub.getPrompt(promptKey);

  // format prompt with interpolation variables
  const messages = hub.formatPrompt(prompt, { ...options });

  // invoke model
  return callLLM(messages);
}

async function run() {
  const options: TravelPlanOptions = {
    departure: '北京',
    destination: '上海',
    people_num: 2,
    days_num: 5,
    travel_theme: '休闲',
  };

  const result = await cozeLoopTracer.traceable(
    async span => {
      cozeLoopTracer.setInput(span, options);
      const { choices } = await runTravelPlan(options);

      return choices[0].message.content;
    },
    // span name and type
    { name: '旅行专家', type: 'Agent' },
  );

  console.info(result);
  // The trace reporting is asynchronous and has some latency.
  // If **running local files directly**, a short delay is required to ensure successful reporting.
  process.exit(0);
}

run();
