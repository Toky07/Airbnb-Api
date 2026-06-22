import type { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import type { CreatePaymentCommand } from '../commands/CreatePaymentCommand';
import { Payment } from '../../../domain/entities/payment.entity';
import { IPaymentGateway } from '../../../domain/ports/payment-gateway.port';
import { PaymentCreatedEvent } from '../../../domain/events/payment-created.event';
import { EventBus } from '../../../../../shared/domain/event.bus';

export class CreatePaymentCommandHandler {
    constructor(
        private readonly repository: IPaymentRepository,
        private readonly paymentGateway: IPaymentGateway,
    ) {}

    async execute(command: CreatePaymentCommand) {
        const paymentIntentId = await this.createPayment(command);

        const payment = await this.savePayment(command, paymentIntentId);

        await EventBus.getInstance().publish(new PaymentCreatedEvent(
            payment.id!,
            command.propertyType,
            command.propertyId,
          ))
    }

    private async createPayment(command: CreatePaymentCommand): Promise<string> {
        const paymentIntent = await this.paymentGateway.createPaymentIntent({
            amount: command.amount,
            currency: command.currency,
            metadata: {
                userId: command.userId.toString(),
                propertyType: command.propertyType,
                propertyId: command.propertyId.toString(),
            },
        });

        return paymentIntent.id;
    }

    private async savePayment(command: CreatePaymentCommand, paymentIntentId: string): Promise<Payment> {
        const payment = Payment.create({
            amount: command.amount,
            currency: command.currency,
            provider: command.provider,
            userId: command.userId,
            propertyType: command.propertyType,
            propertyId: command.propertyId,
            transactionId: paymentIntentId,
        });

        return this.repository.create(payment);
    }
}
