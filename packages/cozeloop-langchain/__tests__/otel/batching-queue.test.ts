// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { BatchingQueue } from '@cozeloop/langchain/otel';

describe('BatchingQueue', () => {
  it('🧪 should dequeue after delay', async () => {
    vi.useFakeTimers();

    const onDequeue = vi.fn();
    const queue = new BatchingQueue<number>(3, 100, onDequeue);

    queue.enqueue(1);
    queue.enqueue(2);

    expect(onDequeue).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(onDequeue).toHaveBeenCalledWith([1, 2]);

    vi.useRealTimers();
  });

  it('🧪 should dequeue immediately when batch size is reached', () => {
    const onDequeue = vi.fn();
    const queue = new BatchingQueue<number>(2, 1000, onDequeue);

    queue.enqueue(1);
    queue.enqueue(2);

    expect(onDequeue).toHaveBeenCalledWith([1, 2]);
  });

  it('🧪 should dequeue remaining items on flush', () => {
    const onDequeue = vi.fn();
    const queue = new BatchingQueue<number>(3, 1000, onDequeue);

    queue.enqueue(1);
    queue.enqueue(2);
    queue.flush();

    expect(onDequeue).toHaveBeenCalledWith([1, 2]);
  });

  it('🧪 should dequeue remaining items on destroy', () => {
    const onDequeue = vi.fn();
    const queue = new BatchingQueue<number>(3, 1000, onDequeue);

    queue.enqueue(1);
    queue.enqueue(2);
    queue.destroy();

    expect(onDequeue).toHaveBeenCalledWith([1, 2]);
  });

  it('🧪 should clear timer on destroy', () => {
    const onDequeue = vi.fn();
    const queue = new BatchingQueue<number>(3, 1000, onDequeue);

    queue.enqueue(1);
    queue.enqueue(2);
    queue.destroy();

    // eslint-disable-next-line @typescript-eslint/dot-notation -- skip
    expect(queue['_timer']).toBeNull();
    expect(onDequeue).toHaveBeenCalledTimes(1);
  });
});
