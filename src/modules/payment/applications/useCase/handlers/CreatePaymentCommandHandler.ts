import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import type { CreatePaymentCommand } from '../commands/CreatePaymentCommand';
import type { IPaymentGateway } from '../../../domain/ports/payment-gateway.port';
import type { IPaymentPublicConfig } from '../../../domain/ports/payment-public-config.port';
import type { CreatePaymentResult } from '../../dto/create-payment.result';
import { Payment } from '../../../domain/entities/payment.entity';
import { EventBus } from '../../../../../shared/domain/event.bus';
import { PaymentCreatedEvent } from '../../../domain/events/payment-created.event';

export type { CreatePaymentResult };

export class CreatePaymentCommandHandler implements ICommandHandler<
  CreatePaymentCommand,
  CreatePaymentResult
> {
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly paymentPublicConfig: IPaymentPublicConfig,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<CreatePaymentResult> {
    const paymentIntent = await this.paymentGateway.createPaymentIntent({
      amount: command.amount,
      currency: command.currency,
      metadata: {
        userId: command.userId.toString(),
        propertyType: command.propertyType,
        propertyId: command.propertyId.toString(),
      },
    });

    const payment = await this.repository.create(
      Payment.create({
        amount: command.amount,
        currency: command.currency,
        provider: command.provider,
        userId: command.userId,
        propertyType: command.propertyType,
        propertyId: command.propertyId,
        transactionId: paymentIntent.id,
        cartId: command.cartId,
        pricingBreakdown: command.pricingBreakdown,
      }),
    );

    await EventBus.getInstance().publish(
      new PaymentCreatedEvent(
        payment.id!,
        command.propertyType,
        command.propertyId,
      ),
    );

    return {
      paymentId: payment.id!,
      clientSecret: paymentIntent.clientSecret,
      amount: command.amount,
      currency: command.currency,
      publishableKey: this.paymentPublicConfig.getPublishableKey(),
    };
  }
}
