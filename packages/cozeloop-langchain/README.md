# 🧭 CozeLoop LangChain Integration

[![npm version](https://img.shields.io/npm/v/%40cozeloop%2Flangchain)](https://www.npmjs.com/package/@cozeloop/langchain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official LangChain integration for [CozeLoop](https://loop.coze.cn) - seamlessly report traces from your LangChain and LangGraph applications.

## Features

- **CozeloopCallbackHandler**: Automatically capture and report traces to CozeLoop
- Support for both LangChain and LangGraph
- W3C trace context propagation for distributed tracing

## Installation

```sh
npm install @cozeloop/langchain
# or
pnpm install @cozeloop/langchain
```

## Configuration

### Environment Variables

The following environment variables can be used to configure the integration:

| Variable | Description | Example |
|----------|-------------|---------|
| `COZELOOP_WORKSPACE_ID` | Workspace ID for resource association | `'7487806534651887643'` |
| `COZELOOP_API_TOKEN` | API token for authentication. See [Authentication Guide](https://loop.coze.cn/open/docs/cozeloop/authentication-for-sdk) | `'pat_xxxx'` |
| `COZELOOP_OTLP_ENDPOINT` | Trace reporting endpoint | `'https://api.coze.cn/v1/loop/opentelemetry/v1/traces'` |

## Usage

### CozeloopCallbackHandler

The callback handler integrates with LangChain and LangGraph to automatically capture traces.

> **Note**: Since trace exporting is asynchronous, proper cleanup is required:
>
> - **CLI scripts**: Call `await callback.flush()` before exit to ensure all traces are exported.
> - **Server applications**: Call `await callback.shutdown()` during graceful shutdown to release resources.

#### Initialization

```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';

const callback = new CozeloopCallbackHandler({
  // Span exporter configuration
  spanExporter: {
    workspaceId: 'xxx',
    token: 'pat_xxx',
    traceEndpoint: 'https://api.coze.cn/v1/loop/opentelemetry/v1/traces',
  },
  // Optional: Filter specific trace types
  // ignoreAgent: false,
  // ignoreChain: false,
  // ignoreCustomEvent: false,
  // ignoreLLM: false,
  // ignoreRetriever: false,
  // ignorePrompt: false,

  // Optional: Propagate trace context from upstream services
  // propagationHeaders: {
  //   traceparent: '00-b3691bfe8af1415029177821d4114cef-ddd0307891d51ce3-01',
  //   tracestate: '',
  // },
});

// Access W3C propagation headers for downstream services
// const headers = callback.w3cPropagationHeaders;
```

#### With LangChain

```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

const callback = new CozeloopCallbackHandler({ /* ... */ });

const prompt = ChatPromptTemplate.fromTemplate('What is 1 + {number}?');
const model = new ChatOpenAI({});
const chain = prompt.pipe(model);

const resp = await chain.invoke(
  { number: 1 },
  {
    runName: 'SuperChain',
    callbacks: [callback],
  },
);

// Ensure traces are exported before script exits
await callback.flush();
```

#### With LangGraph

```typescript
import { CozeloopCallbackHandler } from '@cozeloop/langchain';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

const callback = new CozeloopCallbackHandler({ /* ... */ });

const agent = createReactAgent({
  llm: model,
  tools: [tool1, tool2],
});

const resp = await agent.invoke(
  {
    messages: [{ role: 'user', content: 'Hello!' }],
  },
  { callbacks: [callback] },
);

// Ensure traces are exported before script exits
await callback.flush();
```
