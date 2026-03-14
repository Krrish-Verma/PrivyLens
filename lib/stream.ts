/**
 * In-memory event stream (simulates AWS Kinesis in cloud architecture).
 * Events are enqueued by the API and consumed by the worker.
 */

export interface StreamEvent {
  userId: string;
  event: string;
  page: string;
  timestamp: number;
}

const queue: StreamEvent[] = [];

/**
 * Add an event to the stream queue.
 */
export function enqueueEvent(event: StreamEvent): void {
  queue.push(event);
}

/**
 * Remove and return the next event from the queue, or undefined if empty.
 */
export function dequeueEvent(): StreamEvent | undefined {
  return queue.shift();
}

/**
 * Get current queue length (for monitoring).
 */
export function getQueueLength(): number {
  return queue.length;
}
