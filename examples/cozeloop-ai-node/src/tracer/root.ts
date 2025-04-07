import { cozeLoopTracer } from '@cozeloop/ai';

import { doSomething } from './utils';

export async function runRoot() {
  // We recommend concatenating a complete user request into a trace,
  // so the recommended approach is to report a root span at the entrance of the entire execution
  await cozeLoopTracer.traceable(
    async () => {
      // execute your method
      const result = await doSomething();

      return result;
    },
    {
      name: 'TestRootSpan',
      type: 'RootSpanType',
    },
  );
}
