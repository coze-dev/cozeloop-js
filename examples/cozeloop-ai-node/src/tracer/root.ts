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
      // you can set your own baggage fields (eg. userId),
      // these fields will be automatically passed through and set in all sub-spans
      userId: 'uid-123',
      messageId: 'msg-123',
      threadId: 'thread-123',
    },
  );
}
