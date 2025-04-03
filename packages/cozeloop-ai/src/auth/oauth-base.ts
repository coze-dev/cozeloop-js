// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { LoopLoggable } from '../utils/logger';
import { getUserAgentHeaders } from '../api/api-client';

export interface OAuthCodeToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface OAuthRefreshTokenReq {
  refreshToken: string;
  clientSecret?: string;
}

export abstract class OAuthBaseFlow extends LoopLoggable {
  protected readonly GET_TOKEN_URL = '/api/permission/oauth2/token';

  protected readonly HEADERS = getUserAgentHeaders();
}
