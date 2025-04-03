# API Client

ApiClient is a lightweight wrap of axios for base Loop request. It's used in `PromptHub`, trace initialization, etc.

## Quick start
```typescript
import { ApiClient } from '@cozeloop/ai';

const apiClient = new ApiClient({
  baseURL: 'https://api.coze.cn',
  token: 'your_api_token',
  // axiosInstance: axios,
  // axiosOptions: {},
  // headers: {};
});

const resp = await apiClient.post('/v1/api_url', {/** data */});
```

## API interface
* `ApiClientOptions`

| Params | Types | Description |
|--------|-------|-------------|
| baseURL | string? | Api baseURL, default value is: process.env.COZELOOP_API_BASE_URL or https://api.coze.cn |
| token | string \| GetApiTokenFn? | Api Token: Personal Access Token (PAT) or OAuth2.0 token, or a function to get token, else use process.env.COZELOOP_API_TOKEN |
| axiosOptions | RequestOptions? | Partial [axios request-config](https://github.com/axios/axios?tab=readme-ov-file#request-config), excludes url, method, baeURL, data and responseType |
| axiosInstance | AxiosInstance? | Custom axios instance |
| headers | Record<string, unknown>? | Custom headers |
| logger | SimpleLogger? | A logger function to print debug message |

* Methods of `ApiClient`
  * `post(url, body, streaming, options)`
  * `get(url, params, streaming, options)`
  * `put(url, body, streaming, options)`
  * `delete(url, body, streaming, options)`
