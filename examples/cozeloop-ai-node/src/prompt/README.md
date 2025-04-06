# Prompt

## Prompt Hub

### 1. Quick start
```typescript
import { type Message, type PromptVariables, PromptHub } from '@cozeloop/ai';

const hub = new PromptHub({
  // workspaceId: 'your_workspace_id',
  apiClient: {
    // baseURL: 'api_base_url',
    // token: 'your_api_token',
  },
  // traceable: true,
});

// get prompt with version 0.0.1
const prompt1 = await hub.get('your_prompt_key', '0.0.1')
// get prompt with latest version
const prompt2 = await hub.get('your_prompt_key')

// format prompt to messages with variables
const messages = hub.formatPrompt(prompt1, { key: 'value' });
```

### 2. API interface
* `PromptHubOptions`

| Params | Types | Description |
|--------|-------|-------------|
| workspaceId | string? | Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided |
| apiClient | ApiClient \| ApiClientOptions | The Loop ApiClient instance or ApiClientOptions |
| cacheOptions | PromptCacheOptions? | Prompt cache options, see PromptCacheOptions |
| traceable | boolean? | Enable trace report for `getPrompt` and `formatPrompt` |
| logger | SimpleLogger? | A logger function to print debug message |

* Methods of `PromptHub`
  * `getPrompt(key: string, version?: string)`
  * `formatPrompt(prompt?: Prompt, variables?: PromptVariables)`
