# 🔐 Authentication

## Personal Access Token

> ⚠️ **DO NOT** share your PAT with others, nor expose it publicly to protect the security of your account.
> Use PAT for test but prod.
> The max expire time of PAT is 30 days.

The Personal Access Token (PAT) is generated in the platform. Each token can be associated with multiple spaces and have the specified interface permissions enabled.

## OAuth Access Token (👍)

### OAuth JWT

#### 1. Quick start

```typescript
import { OAuthJWTFlow } from '@cozeloop/ai';

const authFlow = new OAuthJWTFlow({
  baseURL: 'https://api.coze.cn',
  appId: 'your_app_id',
  aud: 'api.coze.cn',
  keyid: 'your_public_key';
  privateKey: 'your_private_key';
});

const tokenResp = await authFlow.getToken();

assert.ok(tokenResp.access_token); // use access_token to access apis.
```

#### 2. API Interface
* `OAuthJWTFlowOptions`

| Params | Types | Description |
|--------|-------|-------------|
| baseURL | string? | Api base url, use process.env.COZELOOP_API_BASE_URL when unprovided |
| appId | string? | OAuth app id, use process.env.COZELOOP_JWT_OAUTH_CLIENT_ID when unprovided |
| aud | string? | |
| keyid | string? | Public key, use process.env.COZELOOP_JWT_OAUTH_CLIENT_ID when unprovided |
| privateKey | string? | Private key, use process.env.COZELOOP_JWT_OAUTH_PRIVATE_KEY when unprovided |
| algorithm | Algorithm? | JWT signature algorithm, @default 'RS256' |
| sessionName | string? | Isolate different sub-resources under the same jwt account |
| logger | SimpleLogger? | A logger function to print debug message |


* Methods of `OAuthJWTFlow`
  * `getToken(req?: OAuthJWTFlowGetTokenReq)`
  ```typescript
  interface OAuthJWTFlowGetTokenReq {
    /** @default 900s */
    durationSeconds?: number;
    scope?: JWTScope;
    /** same as user id */
    accountId?: string;
  }

  interface JWTScope {
    account_permission: {
      permission_list: string[];
    };
    attribute_constraint: {
      connector_bot_chat_attribute: {
        bot_id_list: string[];
      };
    };
  }
  ```
