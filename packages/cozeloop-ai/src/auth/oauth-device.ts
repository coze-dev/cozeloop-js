// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type SimpleLogger } from '../utils/logger';
import { ensureProperty, EnvKeys, isBrowser } from '../utils/env';
import { http } from '../api';
import { delay } from './utils';
import {
  type OAuthCodeToken,
  type OAuthRefreshTokenReq,
  OAuthBaseFlow,
} from './oauth-base';

export interface OAuthDeviceCodeFlowOptions {
  baseURL?: string;
  clientId?: string;
  workspaceId?: string;
  logger?: SimpleLogger;
}

export interface DeviceCodeData {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DeviceTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export interface OAuthDeviceGrantGetTokenReq {
  deviceCode: string;
  interval?: number;
  poll?: boolean;
  maxPoll?: number;
}

const POLL_INTERVAL = 5000;
const MAX_POLL = 6;

/** Device Authorization Grant (see [Flow](https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/8c0dad30104644dfbe11ff91502d6a4b~tplv-goo7wpa0wc-quality:q75.awebp)) */
export class OAuthDeviceCodeFlow extends OAuthBaseFlow {
  private _options: OAuthDeviceCodeFlowOptions;

  constructor(options?: OAuthDeviceCodeFlowOptions) {
    super(options?.logger, 'OAuthDeviceCodeFlow');
    const baseURL = ensureProperty({
      propName: 'baseURL',
      envKey: EnvKeys.API_BASE_URL,
      tag: this._tag,
      value: options?.baseURL,
    });

    const clientId = ensureProperty({
      propName: 'clientId',
      envKey: EnvKeys.DEVICE_OAUTH_CLIENT_ID,
      tag: this._tag,
      value: options?.clientId,
    });

    const workspaceId = ensureProperty({
      propName: 'workspaceId',
      envKey: EnvKeys.WORKSPACE_ID,
      tag: this._tag,
      value: options?.workspaceId,
    });

    this._options = { baseURL, clientId, workspaceId };
  }

  private _invariant() {
    if (isBrowser()) {
      throw new Error('Device Authorization Grant is not supported in browser');
    }
  }

  async getDeviceCode() {
    this._invariant();

    const { baseURL, clientId, workspaceId } = this._options;
    const url = workspaceId
      ? `/api/permission/oauth2/workspace_id/${workspaceId}/device/code`
      : '/api/permission/oauth2/device/code';

    this.loopLogger.debug('getDeviceCode url: ', url);
    const resp = await http<DeviceCodeData>({
      baseURL,
      url,
      method: 'POST',
      data: { client_id: clientId },
      headers: this.HEADERS,
    });
    this.loopLogger.debug('getDeviceCode status: ', resp.response.status);
    this.loopLogger.debug('getDeviceCode headers: ', resp.response.headers);

    return resp.json();
  }

  async getToken(req: OAuthDeviceGrantGetTokenReq) {
    this._invariant();

    const {
      deviceCode,
      poll,
      interval = POLL_INTERVAL,
      maxPoll = MAX_POLL,
    } = req;
    const { clientId, baseURL } = this._options;
    const url = this.GET_TOKEN_URL;
    const _queryToken = async () => {
      this.loopLogger.debug('getToken url: ', url);
      const resp = await http<DeviceTokenData>({
        baseURL,
        method: 'POST',
        url,
        data: {
          client_id: clientId,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode,
        },
        headers: this.HEADERS,
      });
      this.loopLogger.debug('getToken status: ', resp.response.status);
      this.loopLogger.debug('getToken headers: ', resp.response.headers);

      return resp.json();
    };

    if (!poll) {
      return _queryToken();
    }

    let polling = 1;
    while (polling < maxPoll) {
      try {
        this.loopLogger.debug('getToken polling at ', polling);
        polling++;
        const token = await _queryToken();
        return token;
      } catch (error) {
        if (polling < maxPoll) {
          await delay(interval);
          continue;
        }

        throw error;
      }
    }
  }

  async refreshToken(req: OAuthRefreshTokenReq) {
    const { refreshToken } = req;
    const { baseURL, clientId } = this._options;

    this.loopLogger.debug('refreshToken url: ', this.GET_TOKEN_URL);
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
    this.loopLogger.debug('refreshToken status: ', resp.response.status);
    this.loopLogger.debug('refreshToken headers: ', resp.response.headers);

    return resp.json();
  }
}
