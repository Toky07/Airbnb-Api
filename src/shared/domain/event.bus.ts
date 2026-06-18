import { DomainEvent } from './domain.event';

type Handler<T extends DomainEvent> = (event: T) => Promise<void>;

export class EventBus {
  private handlers = new Map<string, Handler<any>[]>();
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
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.unsubscribe(eventName, handler);
        reject(new Error(`Timeout waiting for ${eventName}`));
      }, timeoutMs);

      const handler = async (event: T) => {
        if (!predicate(event)) {
          return;
        }

        clearTimeout(timeout);
        this.unsubscribe(eventName, handler);
        resolve(event);
      };

      this.subscribe(eventName, handler);
    });
  }
}
