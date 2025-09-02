import assert from 'node:assert';

import { ApiClient } from '@cozeloop/ai';

export async function run() {
  const apiClient = new ApiClient({
    /**
     * Api baseURL, default value is:
     * * process.env.COZELOOP_API_BASE_URL
     * * https://api.coze.cn
     */
    // baseURL: 'https://api.coze.cn',
    /**
     * Personal Access Token (PAT) or OAuth2.0 token, or a function to get token.
     * use process.env.COZELOOP_API_TOKEN when unprovided
     */
    // token: '',
    /** Custom axios instance */
    // axiosInstance: axios,
    /**
     * Partial [axios request-config](https://github.com/axios/axios?tab=readme-ov-file#request-config), excludes url, method, baeURL, data and responseType.
     */
    // axiosOptions: {},
    /** Custom headers */
    // headers: {};
  });

  const resp = await apiClient.post<{ code: number }>('/v1/loop/prompts/mget', {
    workspace_id: '7306823955623854124',
    queries: [
      {
        prompt_key: 'loop',
        version: '0.0.3',
      },
    ],
  });

  assert.strictEqual(resp.code, 0);
  process.exit(0);
}
