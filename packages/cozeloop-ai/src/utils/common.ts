// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { isPlainObject } from 'remeda';

export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) {
      return 1;
    } else if (v1Part < v2Part) {
      return -1;
    }
  }

  return 0;
}

/**
 * merge config (⚠️ cannot handle circular references)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- skip
export function mergeConfig<T = any>(...objects: any[]) {
  return objects.reduce((result, obj) => {
    if (obj === undefined) {
      return result || {};
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (isPlainObject(obj[key]) && !Array.isArray(obj[key])) {
          result[key] = mergeConfig(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }, {}) as T;
}

export function stringifyVal(val: unknown) {
  switch (typeof val) {
    case 'number':
    case 'bigint':
      return `${val}`;
    case 'boolean':
      return val ? 'true' : 'false';
    case 'string':
    case 'symbol':
      return val.toString();
    case 'object':
      return val === null
        ? ''
        : val instanceof Date
          ? val.toISOString()
          : JSON.stringify(val);
    case 'undefined':
      return '';
    case 'function':
      return `function@${val.name}`;
    default:
      return '';
  }
}

/** parse value to number safely, NaN is treated as undefined */
export function safeNumber(value: unknown) {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }
    const parsed = Number(trimmed);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}
