// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type SimpleLogger } from '../utils/logger';
import { http } from '../api';
// import { EnvKeys, getEnvVar } from '../utils/env';
import {
  OAuthBaseFlow,
  type OAuthCodeToken,
  type OAuthRefreshTokenReq,
} from './oauth-base';

export interface OAuthCodeFlowOptions {
  baseURL?: string;
  clientId: string;
  redirectUrl: string;
  state?: string;
  workspaceId?: string;
  logger?: SimpleLogger;
}

export interface OAuthCodeGetTokenReq {
  code: string;
  clientSecret: string;
}

/** @reserved Authorization Code Grant  */
export class OAuthCodeGrantFlow extends OAuthBaseFlow {
  private _options: OAuthCodeFlowOptions;

  constructor(options: OAuthCodeFlowOptions) {
    super(options.logger, 'OAuthCodeGrantFlow');
    this._options = options;
  }

  getAuthenticationUrl() {
    const {
      baseURL = '',
      clientId,
      redirectUrl,
      state = '',
      workspaceId,
    } = this._options;
    const domain = baseURL.replace('https://api', 'https://www');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUrl,
      state,
    });

    return workspaceId
      ? `${domain}/api/permission/oauth2/workspace_id/${workspaceId}/authorize?${params.toString()}`
      : `${domain}/api/permission/oauth2/authorize?${params.toString()}`;
  }

  async getToken(req: OAuthCodeGetTokenReq) {
    const { code, clientSecret } = req;
    const { baseURL, clientId, redirectUrl } = this._options;
    const resp = await http<OAuthCodeToken>({
      baseURL,
      url: this.GET_TOKEN_URL,
      method: 'POST',
      data: {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUrl,
      },
      headers: { ...this.HEADERS, Authorization: `Bearer ${clientSecret}` },
    });

    return resp.json();
  }

  async refreshToken(req: OAuthRefreshTokenReq) {
    const { refreshToken, clientSecret } = req;
    const { baseURL, clientId } = this._options;
    const resp = await http<OAuthCodeToken>({
      baseURL,
      url: this.GET_TOKEN_URL,
      method: 'POST',
      data: {
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers: { ...this.HEADERS, Authorization: `Bearer ${clientSecret}` },
    });

    return resp.json();
  }
}
