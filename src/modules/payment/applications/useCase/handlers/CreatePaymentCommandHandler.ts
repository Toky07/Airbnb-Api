import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { CreatePaymentCommand } from '@src/modules/payment/applications/useCase/commands/CreatePaymentCommand';
import type { IPaymentGateway } from '@src/modules/payment/domain/ports/payment-gateway.port';
import type { IPaymentPublicConfig } from '@src/modules/payment/domain/ports/payment-public-config.port';
import type { CreatePaymentResult } from '@src/modules/payment/applications/dto/create-payment.result';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import { EventBus } from '@src/shared/domain/event.bus';
import { PaymentCreatedEvent } from '@src/modules/payment/domain/events/payment-created.event';

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
        ...(command.hostUserId != null
          ? { hostUserId: command.hostUserId.toString() }
          : {}),
        ...(command.transferDestination
          ? { stripeAccountId: command.transferDestination }
          : {}),
      },
      ...(command.transferDestination
        ? { transferDestination: command.transferDestination }
        : {}),
      ...(command.applicationFeeAmount != null
        ? { applicationFeeAmount: command.applicationFeeAmount }
        : {}),
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
        hostUserId: command.hostUserId,
        stripeAccountId: command.transferDestination,
        applicationFeeAmount: command.applicationFeeAmount,
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
