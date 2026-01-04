// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type HrTime } from '@opentelemetry/api';

import { type SerializedTagValue } from '../types';

export function serializeTagValue(value: unknown) {
  if (typeof value === 'object' && value !== null) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return JSON.stringify(value);
  }
  return value as SerializedTagValue;
}

export function convertHrTimeToMicroseconds(hrTime: HrTime): number {
  const [seconds, nanoseconds] = hrTime || [];

  const timeInMicroseconds = Math.floor(
    seconds * 1_000_000 + nanoseconds / 1000,
  );

  return timeInMicroseconds;
}

export function safeJSONParse<T>(text: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (error) {
    return defaultValue;
  }
}
