# 🧭 CozeLoop LangChain Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Integrate Langchain with Cozeloop via `@cozeloop/langchain`, supports:
* `CozeloopCallbackHandler`: report trace to Cozeloop

## Quick Start

### 1. Installation

```sh
npm install @cozeloop/langchain
# or
pnpm install @cozeloop/langchain
```

### 2. Basic Usage

1. Environment variables

The following variables are optional, and will be used if values provided.

|Variable|Comment|Example|
|----|----|------|
|COZELOOP_WORKSPACE_ID|Cozeloop workspace id, used to identify the workspace to which resource such as trace belongs|'7487806534651887643'|
|COZELOOP_API_TOKEN|Cozeloop api token, see [authentication-for-sdk](https://loop.coze.cn/open/docs/cozeloop/authentication-for-sdk) |'pat_xxxx'|
|COZELOOP_OTLP_ENDPOINT|Trace endpoint|'https://api.coze.cn/v1/loop/opentelemetry/v1/trace'|


2. `CozeloopCallbackHandler`

Callbacks can be used with LangChain and LangGraph.

Since the traces exporting is asynchronous, it can be interrupted by the termination of Node.js process.

(1) When you run a file in command line, call `await callback.flush();` to ensure all traces exported.

(2) If you are running a server-side application, there is no need to flush, but it's recommended to call `await callback.shutdown();` to clean resource.

* Initialize

```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';

// initialize callback
const callback = new CozeloopCallbackHandler({
  // Common callback params
  // ignoreAgent: false,
  // ignoreChain: false,
  // ignoreCustomEvent: false,
  // ignoreLLM: false,
  // ignoreRetriever: false,
  // ignorePrompt: false,
  /** Span exporter */
  spanExporter: {
    workspaceId: 'xxx',
    token: 'pat_xxx',
    traceEndpoint: 'https://api.coze.cn/v1/loop/opentelemetry/v1/traces',
  },
  /** Propagate with upstream services */
  // propagationHeaders: {
  //   tracestate: '',
  //   traceparent: '00-b3691bfe8af1415029177821d4114cef-ddd0307891d51ce3-01',
  // },
});

// use to propagate with downstream services
// callback.w3cPropagationHeaders
```

* With LangChain
```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Chain
const prompt = ChatPromptTemplate.fromTemplate('What is 1 + {number}?');
const model = new CustomLLM({});
const chain = prompt.pipe(model);
const callback = new CozeloopCallbackHandler({ /** options */});

const resp = await chain.invoke(
  { number: 1 },
  {
    runName: 'SuperChain',
    callbacks: [callback], // set callback
  },
);

// call `flush` to ensure trace exported in script run
await callback.flush();
```

* With LangGraph
```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';

import { createReactAgent } from '@langchain/langgraph/prebuilt';

const agent = createReactAgent({
  llm: model,
  tools: [tool1, tool2],
});

const resp = await graphAgent.invoke(
  {
    messages: [
      {
        role: 'user',
        content: 'xxx',
      },
    ],
  },
  { callbacks: [callback] }, // set callback
);

// call `flush` to ensure trace exported in script run
await callback.flush();
```
