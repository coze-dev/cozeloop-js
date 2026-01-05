// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- skip
// @ts-nocheck

if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) {
  Symbol.asyncIterator = Symbol.for('Symbol.asyncIterator');
}

// see https://gist.github.com/MattiasBuelens/496fc1d37adb50a733edd43853f2f60e
if (
  typeof ReadableStream !== 'undefined' &&
  typeof ReadableStream.prototype.values === 'undefined'
) {
  ReadableStream.prototype.values = function ({ preventCancel = false } = {}) {
    const reader = this.getReader();
    return {
      async next() {
        try {
          const result = await reader.read();
          if (result.done) {
            reader.releaseLock();
          }
          return result;
        } catch (e) {
          reader.releaseLock();
          throw e;
        }
      },
      async return(value) {
        if (!preventCancel) {
          const cancelPromise = reader.cancel(value);
          reader.releaseLock();
          await cancelPromise;
        } else {
          reader.releaseLock();
        }
        return { done: true, value };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  };
}

if (
  typeof ReadableStream !== 'undefined' &&
  typeof ReadableStream.prototype[Symbol.asyncIterator] === 'undefined'
) {
  ReadableStream.prototype[Symbol.asyncIterator] =
    ReadableStream.prototype.values;
}
