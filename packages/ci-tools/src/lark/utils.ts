// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export function safeJsonParse<T>(val: string): T | undefined {
  if (!val) {
    return undefined;
  }

  try {
    return JSON.parse(val) as T;
  } catch {
    // no-catch
    return undefined;
  }
}

/** Zero width char, see {@link https://zerowidthspace.me} */
export const ZERO_WIDTH_CHAR = '​';

export function filterMessageBody(str?: string) {
  if (!str) {
    return '-';
  }

  const emailRegex = /(\b[\w\.-]+@)([\w\.-]+\.\w{2,4}\b)/gi;
  const numberRegex = /(\d{4,})/g;

  return str
    .replace(emailRegex, `$1${ZERO_WIDTH_CHAR}$2`)
    .replace(numberRegex, `$1${ZERO_WIDTH_CHAR}`);
}
