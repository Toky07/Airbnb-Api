import { DomainEvent } from './domain.event';

type Handler<T extends DomainEvent> = (event: T) => Promise<void>;

type PendingWait = {
  cancel: () => void;
};

export type WaitOnceHandle<T extends DomainEvent> = {
  promise: Promise<T>;
  cancel: () => void;
};

export class EventBus {
  private handlers = new Map<string, Handler<any>[]>();
  private pendingWaits = new Set<PendingWait>();
  private static instance: EventBus | null = null;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(eventName: string, handler: Handler<any>) {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  unsubscribe(eventName: string, handler: Handler<any>) {
    const handlers = this.handlers.get(eventName) ?? [];
    this.handlers.set(
      eventName,
      handlers.filter((entry) => entry !== handler),
    );
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    await Promise.all(handlers.map((handler) => handler(event)));
  }

  waitOnce<T extends DomainEvent>(
    eventName: string,
    predicate: (event: T) => boolean,
    timeoutMs = 15000,
  ): WaitOnceHandle<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let handler: Handler<T> | undefined;
    let settled = false;

    const waitHandle: PendingWait = {
      cancel: () => {
        /* assigned below */
      },
    };

    const cleanup = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (handler) {
        this.unsubscribe(eventName, handler);
      }
      this.pendingWaits.delete(waitHandle);
    };

    waitHandle.cancel = cleanup;

    const promise = new Promise<T>((resolve, reject) => {
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for ${eventName}`));
      }, timeoutMs);

      handler = async (event: T) => {
        if (!predicate(event)) {
          return;
        }

        cleanup();
        resolve(event);
      };

      this.subscribe(eventName, handler);
    });

    this.pendingWaits.add(waitHandle);

    return { promise, cancel: cleanup };
  }

  /** Clears all handlers and cancels pending waitOnce subscriptions. */
  clear(): void {
    for (const wait of [...this.pendingWaits]) {
      wait.cancel();
    }
    this.pendingWaits.clear();
    this.handlers.clear();
  }
}
