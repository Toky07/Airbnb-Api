/**
 * Surface publique du module payment.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et helpers de test).
 */
export { CreatePaymentCommand } from '../applications/useCase/commands/CreatePaymentCommand';
export { ConfirmStripePaymentCommand } from '../applications/useCase/commands/ConfirmStripePaymentCommand';
export { VerifyPaymentCommand } from '../applications/useCase/commands/VerifyPaymentCommand';
export type { CreatePaymentResult } from '../applications/dto/create-payment.result';
export type { VerifyPaymentResult } from '../applications/dto/verify-payment.result';
export { PaymentCreatedEvent } from '../domain/events/payment-created.event';
export { PaymentConfirmedEvent } from '../domain/events/payment-confirmed.event';
export { Payment } from '../domain/entities/payment.entity';
export {
  PAYMENT_STATUS,
  type PaymentStatus,
} from '../domain/constants/payment-status.constant';
export { PAYMENT_PROVIDER } from '../domain/constants/payment-provider.constant';
export { PAYMENT_TYPE, type PaymentType } from '../domain/types/payment.type';
export {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '../domain/ports/payment-gateway.port';
export {
  PAYMENT_PUBLIC_CONFIG,
  type IPaymentPublicConfig,
} from '../domain/ports/payment-public-config.port';
export {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../domain/repositories/payment.repository';
