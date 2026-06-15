import { DomainEvent } from "./domain.event";

type Handler<T extends DomainEvent> =
  (event: T) => Promise<void>;

export class EventBus {
    private handlers = new Map<
        string,
        Handler<any>[]
    >();
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

    async publish(event: DomainEvent): Promise<void> {
        const handlers = this.handlers.get(
            event.eventName,
          ) ?? [];

        await Promise.all(
          handlers.map((handler) =>
            handler(event),
          ),
        );
    }
}
