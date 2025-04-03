# CozeLoop SDK

[![npm version](https://img.shields.io/npm/v/%40cozeloop%2Fai)](https://www.npmjs.com/package/@cozeloop/ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | 简体中文

[扣子罗盘](https://loop.coze.cn) 平台官方 Node.js SDK.

## 快速开始

### 1. 安装

```sh
npm install @cozeloop/ai
# 或
pnpm install @cozeloop/ai
```

### 2. 基础用法
```typescript
import { ApiClient, PromptHub } from '@cozeloop/ai';

// 1. 设置 ApiClient
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: 'your_access_token',
});

// 2. 使用 PromptHub 获取 Prompt
const promptHub = new PromptHub({
  // 或设置环境变量 process.env.COZELOOP_WORKSPACE_ID,
  workspaceId: 'your_workspace_id',
  apiClient,
});

const prompt = await promptHub.getPrompt(
  'your_prompt_key',
  'prompt_version (optional)',
);
```

## 主要特性
- 🗄️ **Prompt Hub**: 在 [CozeLoop](https://coze.loop.cn) 平台开发、提交和发布 Prompt，使用 `PromptHub` 访问 Prompt。
- 🔐 **多种鉴权方式**: PAT and JWT
- ⚙️ **可配置**: 超时、请求头、信号、调试

## 鉴权方式

1. 个人访问令牌（PAT，最简单）
```typescript
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: 'your_pat_token',
});
```

2. JWT 鉴权
```typescript
const authFlow = new OAuthJWTFlow({
  baseURL: 'https://api.coze.cn',
  appId: '1177045121217', // 授权应用 App Id
  aud: 'api.coze.cn', //  使用 api.coze.cn
  keyid: 'public_key_id of Auth App',
  privateKey: 'priveate_key_content',
});

const tokenResp = await authFlow.getToken();
const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: tokenResp.access_token,
});
```
