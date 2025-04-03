// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { PropertyUnprovidedError } from '../error';

export enum EnvKeys {
  API_BASE_URL = 'COZELOOP_API_BASE_URL',
  WORKSPACE_ID = 'COZELOOP_WORKSPACE_ID',
  API_TOKEN = 'COZELOOP_API_TOKEN',
  DEVICE_OAUTH_CLIENT_ID = 'COZELOOP_DEVICE_OAUTH_CLIENT_ID',
  JWT_OAUTH_CLIENT_ID = 'COZELOOP_JWT_OAUTH_CLIENT_ID',
  JWT_OAUTH_PRIVATE_KEY = 'COZELOOP_JWT_OAUTH_PRIVATE_KEY',
  JWT_OAUTH_PUBLIC_KEY_ID = 'COZELOOP_JWT_OAUTH_PUBLIC_KEY_ID',
  REQUEST_TIMEOUT = 'COZELOOP_REQUEST_TIMEOUT',
}

export function isBrowser() {
  return typeof window !== 'undefined' && window !== null;
}

export function getEnvVar(key: EnvKeys, providedValue?: string) {
  if (isBrowser() || typeof process === 'undefined') {
    return providedValue;
  }

  // eslint-disable-next-line security/detect-object-injection -- skip
  return providedValue ?? process.env[key];
}

interface EnsurePropertyOptions {
  propName: string;
  envKey: EnvKeys;
  value?: string;
  tag?: string;
}

export function ensureProperty({
  propName,
  envKey,
  value,
  tag,
}: EnsurePropertyOptions) {
  const val = getEnvVar(envKey, value);

  if (!val) {
    throw new PropertyUnprovidedError({
      propName,
      envKey,
      tag,
    });
  }

  return val;
}
