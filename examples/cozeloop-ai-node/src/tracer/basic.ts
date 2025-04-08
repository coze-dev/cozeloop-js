import { cozeLoopTracer } from '@cozeloop/ai';

import { doSomething } from './utils';

export async function runCustom() {
  // Wrap any function to make it traceable
  await cozeLoopTracer.traceable(
    async parentSpan => {
      // Manually set input
      cozeLoopTracer.setInput(parentSpan, 'xxx');

      // Invoke any function, if it throws error, error will be caught and automatically set span as error
      const result = await doSomething();

      // Or, you can manually set error
      cozeLoopTracer.setError(parentSpan, 'custom error message');

      // You can also trace nested span, the parent-child relationship of span will be automatically concatenated
      await cozeLoopTracer.traceable(
        async childSpan => {
          // Set custom tags
          childSpan.setAttribute('custom-tag', 'xxx');

          await doSomething();
        },
        {
          name: 'TestCustomChildSpan',
          type: 'MyCustomType',
        },
      );

      // Automatically set return value as output
      return result;
    },
    {
      name: 'TestCustomParentSpan',
      type: 'MyCustomType',
    },
  );
}
