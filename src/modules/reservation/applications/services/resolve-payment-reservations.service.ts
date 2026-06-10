import { Inject, Injectable } from '@nestjs/common';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { resolvePaymentReservationIds } from '../dto/booking-order.output';
import { EnrichReservationOutputsService } from './enrich-reservation-outputs.service';

@Injectable()
export class ResolvePaymentReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async resolveForPayment(payment: Payment): Promise<ReservationOutput[]> {
    const reservationIds = resolvePaymentReservationIds(payment);
    if (reservationIds.length === 0) {
      return [];
    }

    const reservations = await this.reservationRepository.findByIds(reservationIds);
    const outputs = reservations.map((reservation) =>
      ReservationOutput.fromDomain(reservation),
    );

    return this.enrichReservationOutputs.enrich(outputs);
  }

  async resolveForPayments(
    payments: Payment[],
  ): Promise<Map<number, ReservationOutput[]>> {
    const reservationIds = [
      ...new Set(payments.flatMap((payment) => resolvePaymentReservationIds(payment))),
    ];

    if (reservationIds.length === 0) {
      return new Map();
    }

    const reservations = await this.reservationRepository.findByIds(reservationIds);
    const outputs = reservations.map((reservation) =>
      ReservationOutput.fromDomain(reservation),
    );
    const enriched = await this.enrichReservationOutputs.enrich(outputs);
    const enrichedById = new Map(enriched.map((item) => [item.id, item]));

    const grouped = new Map<number, ReservationOutput[]>();

    for (const payment of payments) {
      const items = resolvePaymentReservationIds(payment)
        .map((id) => enrichedById.get(id))
        .filter((item): item is ReservationOutput => item !== undefined);

      if (payment.id) {
        grouped.set(payment.id, items);
      }
    }

    return grouped;
  }
}
