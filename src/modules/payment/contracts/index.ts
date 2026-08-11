/**
 * Surface publique du module payment.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et helpers de test).
 */
export { CreatePaymentCommand } from '@src/modules/payment/applications/useCase/commands/CreatePaymentCommand';
export { ConfirmStripePaymentCommand } from '@src/modules/payment/applications/useCase/commands/ConfirmStripePaymentCommand';
export { VerifyPaymentCommand } from '@src/modules/payment/applications/useCase/commands/VerifyPaymentCommand';
export type { CreatePaymentResult } from '@src/modules/payment/applications/dto/create-payment.result';
export type { VerifyPaymentResult } from '@src/modules/payment/applications/dto/verify-payment.result';
export { PaymentCreatedEvent } from '@src/modules/payment/domain/events/payment-created.event';
export { PaymentConfirmedEvent } from '@src/modules/payment/domain/events/payment-confirmed.event';
export { Payment } from '@src/modules/payment/domain/entities/payment.entity';
export {
  PAYMENT_STATUS,
  type PaymentStatus,
} from '@src/modules/payment/domain/constants/payment-status.constant';
export { PAYMENT_PROVIDER } from '@src/modules/payment/domain/constants/payment-provider.constant';
export {
  PAYMENT_TYPE,
  type PaymentType,
} from '@src/modules/payment/domain/types/payment.type';
export {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '@src/modules/payment/domain/ports/payment-gateway.port';
export {
  PAYMENT_PUBLIC_CONFIG,
  type IPaymentPublicConfig,
} from '@src/modules/payment/domain/ports/payment-public-config.port';
export {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '@src/modules/payment/domain/repositories/payment.repository';
