import assert from 'node:assert';

import { OAuthJWTFlow } from '@cozeloop/ai';

export async function run() {
  const authFlow = new OAuthJWTFlow({
    /** api base url, use process.env.COZELOOP_API_BASE_URL when unprovided */
    // baseURL: 'https://api.coze.cn',
    /** OAuth app id, use process.env.COZELOOP_JWT_OAUTH_CLIENT_ID when unprovided */
    // appId: 'your_app_id',
    /** api endpoint, inferred from `baseURL` */
    aud: 'api.coze.cn',
    /** public key, use process.env.COZELOOP_JWT_OAUTH_CLIENT_ID when unprovided */
    // keyid: 'your_public_key';
    /** private key, use process.env.COZELOOP_JWT_OAUTH_PRIVATE_KEY when unprovided  */
    // privateKey: 'your_private_key';
  });

  const tokenResp = await authFlow.getToken();

  assert.ok(tokenResp.access_token);
  process.exit(0);
}
