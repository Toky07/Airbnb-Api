import { PaymentListener } from "../listeners/payment.listener";
import { Inject, OnModuleInit } from "@nestjs/common";
import { type IReservationRepository, RESERVATION_REPOSITORY } from "../../domain/repositories/reservation.repository";
import { PaymentConfirmedListener } from "../listeners/payment-confirmed.listener";

export class ReservationEvent implements OnModuleInit {
    public constructor(@Inject(RESERVATION_REPOSITORY) private readonly repository: IReservationRepository) {}

    public async onModuleInit(): Promise<void> {
        await this.listen();
    }

    public async listen(): Promise<void> {
        const paymentListener = new PaymentListener(this.repository);
        const paymentConfirmedListener = new PaymentConfirmedListener(this.repository);
        await paymentListener.listen();
        await paymentConfirmedListener.listen();
    }
}
