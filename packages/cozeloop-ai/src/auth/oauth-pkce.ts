// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { subtle as nodeSubtle } from 'node:crypto';

import { type SimpleLogger } from '../utils/logger';
import { http } from '../api';
import { randomStr } from './utils';
import {
  OAuthBaseFlow,
  type OAuthCodeToken,
  type OAuthRefreshTokenReq,
} from './oauth-base';

export interface OAuthPKCEFlowOptions {
  baseURL?: string;
  clientId: string;
  redirectUrl: string;
  state?: string;
  workspaceId?: string;
  codeChallengeMethod?: string;
  logger?: SimpleLogger;
}

export interface OAuthPKCEGetTokenReq {
  code: string;
  codeVerifier: string;
}

function getSubtle() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  } else if (
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node
  ) {
    return nodeSubtle;
  } else {
    throw new Error('Unsupported environment for SHA-256');
  }
}

async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await getSubtle().digest('SHA-256', data);

  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** @reserved Authorization Code Flow with PKCE(Proof Key for Code Exchange), see [Flow](https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/551be271cc5b4b67afe0985764a2e7e5~tplv-goo7wpa0wc-quality:q75.awebp) */
export class OAuthPKCEFlow extends OAuthBaseFlow {
  private _options: OAuthPKCEFlowOptions;

  constructor(options: OAuthPKCEFlowOptions) {
    super(options.logger, 'OAuthPKCEFlow');
    this._options = options;
  }

  async getAuthenticationUrl() {
    const {
      baseURL = '',
      clientId,
      workspaceId,
      redirectUrl,
      state = '',
      codeChallengeMethod = 'S256',
    } = this._options;
    const domain = baseURL.replace('https://api', 'https://www');

    // Generate codeVerifier and codeChallenge
    const codeVerifier = randomStr();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUrl,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    const url = workspaceId
      ? `${domain}/api/permission/oauth2/workspace_id/${workspaceId}/authorize?${params.toString()}`
      : `${domain}/api/permission/oauth2/authorize?${params.toString()}`;

    return { url, codeVerifier };
  }

  async getToken(req: OAuthPKCEGetTokenReq) {
    const { code, codeVerifier } = req;
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
        code_verifier: codeVerifier,
      },
      headers: this.HEADERS,
    });

    return resp.json();
  }

  async refreshToken(req: OAuthRefreshTokenReq) {
    const { refreshToken } = req;
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
      headers: this.HEADERS,
    });

    return resp.json();
  }
}
