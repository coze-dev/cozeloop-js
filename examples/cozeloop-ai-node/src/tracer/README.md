# Trace

The `loopTracer` is based on Open Telemetry which provides:
* `initialize`: Initialize tracer
* `traceable`: Wraps function and report trace
* `forceFlush`: Forces to export all finished spans
* `shutdown`: Shutdown tracer

## 1. Quick start
```typescript
import { LOOP_TRACE_TAGS, loopTracer, SpanKind, PromptHub } from '@cozeloop/ai';

// initialize tracer globally
loopTracer.initialize({
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

// 1. switch PromptHub traceable
const hub = new PromptHub({
  // ...other options
  // set `traceable: true` to enable getPrompt/formatPrompt trace report
  traceable: true,
});

// 2. wrap any function to make it traceable
await loopTracer.traceable(
  async span => {
    // set input
    loopTracer.setInput(span, [{ role: 'user', content: 'hi' }]);
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
```

## 2. API interface

* `LoopTraceInitializeOptions` (initialize options)

| Params | Types | Description |
|--------|-------|-------------|
| apiClient | LoopApiClient | The Loop API client |
| workspaceId | string? | CozeLoop workspace ID |
| ultraLargeReport | boolean? | Allow ultra long text report. If true, the entire content of input and output will be uploaded and reported when exceed the length limit |
| recordInputs | boolean? | Allow input info reporting. Default: true |
| recordOutputs | boolean? | Allow output info reporting. Default: true |
| exporter | SpanExporter? | The OpenTelemetry SpanExporter to be used for sending traces data. Default: LoopTraceExporter |
| processor | SpanProcessor \| 'batch' \| 'simple' \| 'noop'? | The OpenTelemetry SpanProcessor to be used for processing traces data. Default: 'batch' |
| propagator | TextMapPropagator? | The OpenTelemetry Propagator to use. Defaults to OpenTelemetry SDK defaults |
| contextManager | ContextManager? | The OpenTelemetry ContextManager to use. Defaults to OpenTelemetry SDK defaults |
| extraProcessors | SpanProcessor[]? | Extra OpenTelemetry SpanProcessor |
| instrumentations | NodeSDKConfiguration['instrumentations']? | Custom instrumentations |

* Methods of `loopTracer`
  * `initialize(options: LoopTraceInitializeOptions)`
  * `traceable<F extends (span: Span) => ReturnType<F>>(fn: F, options: LoopTraceWrapperOptions): ReturnType<F>`
  * `setInput`
  * `setOutput`
  * `setTag`
  * `setTags`
  * `setError`
  * `forceFlush`
  * `shutdown`

