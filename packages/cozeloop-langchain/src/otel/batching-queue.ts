/**
 * BatchingQueue is a queue class that supports batching and delayed dequeuing.
 *
 * It decides when to dequeue elements based on the specified `batchSize` and `dequeueDelay`.
 * The queue will dequeue elements and call the provided `onDequeue` callback function
 * when the length of the queue reaches `batchSize` or `dequeueDelay` milliseconds have elapsed
 * since the last element was enqueued.
 *
 * Additionally, it provides a `destroy` method to clear the timer and consume any remaining data.
 */
export class BatchingQueue<T> {
  private _queue: T[] = [];
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _onDequeue: ((data: T[]) => Promise<unknown> | unknown) | null = null;
  private _batchSize: number;
  private _dequeueDelay: number;

  /**
   * Create a new instance of BatchingQueue.
   * @param batchSize - The maximum size for batched dequeuing.
   * @param dequeueDelay - The delay in milliseconds before dequeuing.
   * @param onDequeue - The callback function to be called when dequeuing, with the dequeued data as argument.
   */
  constructor(
    batchSize: number,
    dequeueDelay: number,
    onDequeue: (data: T[]) => Promise<unknown> | unknown,
  ) {
    this._batchSize = batchSize;
    this._dequeueDelay = dequeueDelay;
    this._onDequeue = onDequeue;
  }

  /**
   * Enqueue a new element to the queue.
   * @param item - The element to be enqueued.
   */
  enqueue(item: T) {
    this._queue.push(item);
    this.startTimer();

    if (this._queue.length >= this._batchSize) {
      this._dequeue();
    }
  }

  /**
   * Start the delayed dequeue timer.
   * If a timer is already running, it will not be restarted.
   */
  private startTimer() {
    if (this._timer === null) {
      this._timer = setTimeout(() => {
        this._dequeue();
        this._timer = null;
      }, this._dequeueDelay);
    }
  }

  /**
   * Dequeue and consumes data.
   * At most `batchSize` elements will be dequeued, and the `onDequeue` callback will be called.
   */
  private async _dequeue() {
    if (this._queue.length > 0 && this._onDequeue !== null) {
      const batch = this._queue.splice(0, this._batchSize);
      await this._onDequeue(batch);
    }
  }

  /**
   * Flush the queue, and consumes any remaining data.
   */
  async flush() {
    if (this._queue.length > 0 && this._onDequeue !== null) {
      const batch = this._queue.splice(0);
      await this._onDequeue(batch);
    }
  }

  /**
   * Destroy the queue, clear the timer, and flush.
   */
  async destroy() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    await this.flush();
  }
}
