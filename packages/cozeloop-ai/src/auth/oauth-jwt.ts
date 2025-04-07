// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { sign as signJWT, type Algorithm } from 'jsonwebtoken';

import { type SetRequired } from '../utils/types';
import { type SimpleLogger } from '../utils/logger';
import { EnvKeys, isBrowser, ensureProperty } from '../utils/env';
import { http } from '../api';
import { randomStr } from './utils';
import { OAuthBaseFlow } from './oauth-base';

export interface JWTScope {
  account_permission: {
    permission_list: string[];
  };
  attribute_constraint: {
    connector_bot_chat_attribute: {
      bot_id_list: string[];
    };
  };
}

export interface OAuthJWTFlowOptions {
  /** Api base url, use process.env.COZELOOP_API_BASE_URL when unprovided */
  baseURL?: string;
  /** OAuth app id, use process.env.COZELOOP_JWT_OAUTH_CLIENT_ID when unprovided */
  appId?: string;
  /** Api endpoint, inferred from `baseURL` */
  aud?: string;
  /** Public key, use process.env.COZELOOP_JWT_OAUTH_PUBLIC_KEY_ID when unprovided */
  keyid?: string;
  /** Private key, use process.env.COZELOOP_JWT_OAUTH_PRIVATE_KEY when unprovided */
  privateKey?: string;
  /** JWT signature algorithm, @default 'RS256' */
  algorithm?: Algorithm;
  /** Isolate different sub-resources under the same jwt account */
  sessionName?: string;
  /** A logger function to print debug message */
  logger?: SimpleLogger;
}

export interface OAuthJWTFlowGetTokenReq {
  /** @default 900s */
  durationSeconds?: number;
  scope?: JWTScope;
  /** same as user id */
  accountId?: string;
}

export interface JWTToken {
  access_token: string;
  expires_in: number;
}

interface SignJWTPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
  session_name?: string;
}

const DEFAULT_DURATION_SECONDS = 900;

/** JWT Authorization */
export class OAuthJWTFlow extends OAuthBaseFlow {
  private _options: SetRequired<
    OAuthJWTFlowOptions,
    'baseURL' | 'appId' | 'privateKey' | 'keyid' | 'aud'
  >;

  constructor(options: OAuthJWTFlowOptions = {}) {
    super(options.logger, 'OAuthJWTFlow');
    const baseURL = ensureProperty({
      propName: 'baseURL',
      envKey: EnvKeys.API_BASE_URL,
      tag: this._tag,
      value: options.baseURL,
    });

    const appId = ensureProperty({
      propName: 'appId',
      envKey: EnvKeys.JWT_OAUTH_CLIENT_ID,
      tag: this._tag,
      value: options.appId,
    });

    const privateKey = ensureProperty({
      propName: 'privateKey',
      envKey: EnvKeys.JWT_OAUTH_PRIVATE_KEY,
      value: options.privateKey,
      tag: this._tag,
    });

    const keyid = ensureProperty({
      propName: 'keyid',
      envKey: EnvKeys.JWT_OAUTH_PUBLIC_KEY_ID,
      value: options.keyid,
      tag: this._tag,
    });

    const aud = options.aud || new URL(baseURL).host;

    this._options = { ...options, aud, appId, baseURL, privateKey, keyid };
  }

  private _invariant() {
    if (isBrowser()) {
      throw new Error('JWT Authorization is not supported in browser');
    }
  }

  private _validatePrivateKey() {
    // Validate private key format
    const { privateKey = '' } = this._options;
    const keyFormat = privateKey.includes('BEGIN RSA PRIVATE KEY')
      ? 'RSA'
      : privateKey.includes('BEGIN PRIVATE KEY')
        ? 'PKCS8'
        : null;

    if (!keyFormat) {
      throw new Error(
        'Invalid private key format. Expected PEM format (RSA or PKCS8)',
      );
    }
  }

  private _signJWTToken() {
    this._invariant();
    this._validatePrivateKey();

    const {
      appId,
      aud,
      privateKey,
      sessionName,
      keyid,
      algorithm = 'RS256',
    } = this._options;
    const now = Math.floor(Date.now() / 1000);
    const payload: SignJWTPayload = {
      iss: appId,
      aud,
      iat: now,
      exp: now + 3600, // 1 hour
      jti: randomStr(),
    };

    if (sessionName) {
      payload.session_name = sessionName;
    }

    return signJWT(payload, privateKey, { algorithm, keyid });
  }

  async getToken(req?: OAuthJWTFlowGetTokenReq) {
    const { baseURL } = this._options;
    const {
      durationSeconds = DEFAULT_DURATION_SECONDS,
      scope,
      accountId,
    } = req || {};
    const jwtToken = this._signJWTToken();
    const url = accountId
      ? `/api/permission/oauth2/account/${accountId}/token`
      : '/api/permission/oauth2/token';

    this.loopLogger.debug('getToken url: ', url);
    const resp = await http<JWTToken>({
      baseURL,
      url,
      method: 'POST',
      data: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        duration_seconds: durationSeconds,
        scope,
      },
      headers: { ...this.HEADERS, Authorization: `Bearer ${jwtToken}` },
    });
    this.loopLogger.debug('getToken status: ', resp.response.status);
    this.loopLogger.debug('getToken headers: ', resp.response.headers);

    return resp.json();
  }
}
