/**
 * Surface publique du module payment.
 * Les autres modules doivent importer uniquement depuis ce barrel.
 */
export { CreatePaymentCommand } from '../applications/useCase/commands/CreatePaymentCommand';
export { ConfirmStripePaymentCommand } from '../applications/useCase/commands/ConfirmStripePaymentCommand';
export { VerifyPaymentCommand } from '../applications/useCase/commands/VerifyPaymentCommand';
export type { CreatePaymentResult } from '../applications/dto/create-payment.result';
export type { VerifyPaymentResult } from '../applications/dto/verify-payment.result';
export { PaymentCreatedEvent } from '../domain/events/payment-created.event';
export { PaymentConfirmedEvent } from '../domain/events/payment-confirmed.event';
export {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '../domain/ports/payment-gateway.port';
export {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../domain/repositories/payment.repository';
