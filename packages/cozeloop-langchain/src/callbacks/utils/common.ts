// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { randomBytes } from 'node:crypto';

export function generateUUID(): string {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, it => {
    const v = Number(it);

    return (v ^ (randomBytes(1)[0] & (15 >> (v / 4)))).toString(16);
  });
}

export function stringifyVal(val: unknown): string {
  switch (typeof val) {
    case 'number':
    case 'bigint':
      return `${val}`;
    case 'boolean':
      return val ? 'true' : 'false';
    case 'string':
      return val;
    case 'symbol':
      return val.toString();
    case 'object': {
      if (val === null) {
        return '';
      }
      if (val instanceof Date) {
        return val.toISOString();
      }
      if (val instanceof Error) {
        return val.message;
      }
      return JSON.stringify(val);
    }
    case 'undefined':
      return '';
    case 'function':
      return `function@${val.name}`;
    default:
      return '';
  }
}
