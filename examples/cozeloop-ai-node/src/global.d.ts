declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        COZELOOP_API_BASE_URL?: string;
        COZELOOP_WORKSPACE_ID?: string;
        COZELOOP_API_TOKEN?: string;
        COZELOOP_DEVICE_OAUTH_CLIENT_ID?: string;
        COZELOOP_JWT_OAUTH_CLIENT_ID?: string;
        COZELOOP_JWT_OAUTH_PRIVATE_KEY?: string;
        COZELOOP_JWT_OAUTH_PUBLIC_KEY_ID?: string;
        COZELOOP_REQUEST_TIMEOUT?: string;
      }
    }
  }
}
