import { setTimeout } from 'node:timers/promises';

import { COZELOOP_TRACE_TAGS, cozeLoopTracer, SpanKind } from '@cozeloop/ai';

async function fakeLLMCall() {
  await setTimeout(2000, [{ role: 'assistant', content: "hi, I'm xx model" }]);
}

export async function run() {
  // initialize tracer globally
  cozeLoopTracer.initialize({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'https://api.coze.cn',
      // token: 'your_api_token',
      headers: { 'x-tt-env': 'boe_commercial' }, // TODO: remove
    },
    /** Allow ultra long text report */
    // ultraLargeReport: true,
  });

  // wrap function to make it traceable
  await cozeLoopTracer.traceable(
    async span => {
      // set input
      span.setAttribute(
        COZELOOP_TRACE_TAGS.SPAN_INPUT,
        JSON.stringify([{ role: 'user', content: 'hi' }]),
      );
      // invoke/stream model
      const result = await fakeLLMCall();

      // set output
      return JSON.stringify(result);
    },
    {
      name: 'TestModelSpan',
      type: SpanKind.Model,
      // endWhenDone: true
    },
  );
}
