// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { delay, randomStr } from '../../src/auth/utils';

describe('delay', () => {
  it('should delay for the specified amount of time', async () => {
    const start = Date.now();
    const delayTime = 100; // Delay for 100 milliseconds

    await delay(delayTime);

    const end = Date.now();
    const elapsed = end - start;

    // Allow for a small margin of error (e.g., 5 milliseconds)
    expect(elapsed).toBeGreaterThanOrEqual(delayTime - 5);
    expect(elapsed).toBeLessThanOrEqual(delayTime + 5);
  });
});

describe('randomStr', () => {
  it('should generate a random string', () => {
    const randomString1 = randomStr();
    const randomString2 = randomStr();

    expect(randomString1).toBeTruthy();
    expect(randomString2).toBeTruthy();
    expect(randomString1).not.toEqual(randomString2);
  });
});
