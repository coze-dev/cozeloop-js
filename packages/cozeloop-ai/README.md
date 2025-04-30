# 🧭 CozeLoop SDK

[![npm version](https://img.shields.io/npm/v/%40cozeloop%2Fai)](https://www.npmjs.com/package/@cozeloop/ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [简体中文](./README.zh-CN.md)

Official Node.js SDK for [CozeLoop](https://loop.coze.cn) API platform.

## Quick Start

### 1. Installation

```sh
npm install @cozeloop/ai
# or
pnpm install @cozeloop/ai
```

### 2. Basic Usage
```typescript
import { ApiClient, PromptHub } from '@cozeloop/ai';

// 1. setup API client
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: 'your_access_token',
});

// 2. Using prompt hub to get prompt
const promptHub = new PromptHub({
  // or set it as process.env.COZELOOP_WORKSPACE_ID,
  workspaceId: 'your_workspace_id',
  apiClient,
});

const prompt = await promptHub.getPrompt(
  'your_prompt_key',
  'prompt_version (optional)',
);
```

## Key Features
- 🗄️ **Prompt Hub**: Develop, submit and publish prompts on [CozeLoop](https://loop.coze.cn), and access them it via `PromptHub`
- 🔐 **Authentication Methods**: PAT and JWT
- ⚙️ **Configurable**: Timeout, headers, signal, debug options

## Authentication Options

1. Personal Access Token (PAT, the simplest way)
```typescript
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: 'your_pat_token',
});
```

2. JWT
```typescript
const authFlow = new OAuthJWTFlow({
  baseURL: 'https://api.coze.cn',
  appId: '1177045121217', // Auth App Id
  aud: 'api.coze.cn', // just use api.coze.cn
  keyid: 'public_key_id of Auth App',
  privateKey: 'private_key_content',
});

const tokenResp = await authFlow.getToken();
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: tokenResp.access_token,
});
```
