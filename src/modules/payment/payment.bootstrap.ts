import { IPaymentRepository } from "./domain/repositories/payment.repository";
import { IPaymentGateway } from "./domain/ports/payment-gateway.port";
import { CreatePaymentCommandHandler } from "./applications/useCase/handlers/CreatePaymentCommandHandler";
import { ConfirmStripePaymentCommandHandler } from "./applications/useCase/handlers/ConfirmStripePaymentCommandHandler";
import { MapStripeStatusService } from "./applications/services/map-stripe-status.service";

export class PaymentBootstrap {
    static create(
        repository: IPaymentRepository,
        paymentGateway: IPaymentGateway,
    ) {

        const mapStripeStatus = new MapStripeStatusService();
        
        const createPaymentCommandHandler = new CreatePaymentCommandHandler(
            repository,
            paymentGateway,
        );

        const confirmStripePaymentCommandHandler = new ConfirmStripePaymentCommandHandler(
            repository,
            mapStripeStatus,
        );

        return {
            createPaymentCommandHandler,
            confirmStripePaymentCommandHandler,
        }
    }
}