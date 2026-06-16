import { DomainEvent } from "../../../../shared/domain/domain.event";

export class PaymentConfirmedEvent implements DomainEvent {
    eventName = 'payment.confirmed';
    occurredOn = new Date();

    constructor(public readonly paymentId: number) {}
}
