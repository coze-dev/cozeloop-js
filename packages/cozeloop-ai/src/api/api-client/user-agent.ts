// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import os from 'node:os';

import { isBrowser } from '../../utils/env';

function getOSEnv() {
  const nodeVersion = process.version.slice(1); // Remove 'v' prefix
  const { platform } = process;

  let osName = platform.toLowerCase();
  let osVersion = os.release();

  if (platform === 'darwin') {
    osName = 'macos';
    // Try to parse the macOS version
    try {
      const darwinVersion = os.release().split('.');
      if (darwinVersion.length >= 2) {
        const majorVersion = parseInt(darwinVersion[0], 10);
        if (!isNaN(majorVersion) && majorVersion >= 9) {
          const macVersion = majorVersion - 9;
          osVersion = `10.${macVersion}.${darwinVersion[1]}`;
        }
      }
    } catch (error) {
      // Keep the default os.release() value if parsing fails
    }
  } else if (platform === 'win32') {
    osName = 'windows';
    osVersion = os.release();
  } else if (platform === 'linux') {
    osName = 'linux';
    osVersion = os.release();
  }

  return { osName, osVersion, nodeVersion };
}

function getSDKVersion() {
  return process.env.COZELOOP_VERSION || '-';
}

function getUserAgent() {
  const { nodeVersion, osName, osVersion } = getOSEnv();

  return `cozeloop-js/${getSDKVersion()} node/${nodeVersion} ${osName}/${osVersion}`.toLowerCase();
}

function getNodeClientUserAgent() {
  const { osVersion, nodeVersion, osName } = getOSEnv();

  const ua = {
    version: getSDKVersion(),
    lang: 'node',
    lang_version: nodeVersion,
    os_name: osName,
    os_version: osVersion,
    scene: 'cozeloop',
    source: 'openapi',
  };

  return JSON.stringify(ua);
}

// eslint-disable-next-line complexity -- it's complex!
function getBrowserClientUserAgent() {
  const browserInfo = {
    name: 'unknown',
    version: 'unknown',
  };
  const osInfo = {
    name: 'unknown',
    version: 'unknown',
  };

  const { userAgent } = navigator;

  // os version
  if (userAgent.indexOf('Windows') > -1) {
    osInfo.name = 'windows';
    const windowsVersion =
      userAgent.match(/Windows NT ([0-9.]+)/)?.[1] || 'unknown';
    osInfo.version = windowsVersion;
  } else if (userAgent.indexOf('Mac OS X') > -1) {
    osInfo.name = 'macos';
    osInfo.version = (
      userAgent.match(/Mac OS X ([0-9_]+)/)?.[1] || 'unknown'
    ).replace(/_/g, '.');
  } else if (userAgent.indexOf('Linux') > -1) {
    osInfo.name = 'linux';
    osInfo.version = userAgent.match(/Linux ([0-9.]+)/)?.[1] || 'unknown';
  }

  // browser version
  if (userAgent.indexOf('Chrome') > -1) {
    browserInfo.name = 'chrome';
    browserInfo.version =
      userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserInfo.name = 'firefox';
    browserInfo.version =
      userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserInfo.name = 'safari';
    browserInfo.version =
      userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
  }

  const ua = {
    version: getSDKVersion(),
    browser: browserInfo.name,
    browser_version: browserInfo.version,
    os_name: osInfo.name,
    os_version: osInfo.version,
  };

  return JSON.stringify(ua);
}

export const getUserAgentHeaders = (() => {
  const ua = 'User-Agent';
  const clientUa = 'X-Coze-Client-User-Agent';
  let userAgentHeaders: Record<string, string> | undefined;

  return () =>
    userAgentHeaders ||
    (userAgentHeaders = isBrowser()
      ? {
          [clientUa]: getBrowserClientUserAgent(),
        }
      : {
          [ua]: getUserAgent(),
          [clientUa]: getNodeClientUserAgent(),
        });
})();
