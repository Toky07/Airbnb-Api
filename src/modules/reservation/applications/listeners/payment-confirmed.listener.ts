import { Inject } from "@nestjs/common";
import { RESERVATION_REPOSITORY } from "../../domain/repositories/reservation.repository";
import type { IReservationRepository } from "../../domain/repositories/reservation.repository";
import { EventBus } from "../../../../shared/domain/event.bus";
import { ConfirmReservationUseCase } from "../useCase/confirm-reservation.usecase";

export class PaymentConfirmedListener {
    private readonly confirmReservationUseCase: ConfirmReservationUseCase;

    constructor(
        @Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: IReservationRepository) {
            this.confirmReservationUseCase = new ConfirmReservationUseCase(this.reservationRepository);
        }

    async listen(): Promise<void> {
        EventBus.getInstance().subscribe('payment.confirmed', async (payload) => {
            const reservation = await this.reservationRepository.findByPaymentId(payload.paymentId);

            if (!reservation?.id) {
                throw new Error('Reservation not found');
            }

            await this.confirmReservationUseCase.execute(reservation.id);
        });
    }
}
