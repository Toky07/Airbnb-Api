import { Inject, Injectable } from '@nestjs/common';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationItemOutput } from '../dto/reservation-item.output';
import { resolvePaymentReservationIds } from '../dto/booking-order.output';
import { EnrichReservationOutputsService } from './enrich-reservation-outputs.service';
import { ReservationOutput } from '../dto/reservation.output';

@Injectable()
export class ResolvePaymentReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async resolveForPayment(payment: Payment): Promise<ReservationItemOutput[]> {
    const reservationIds = resolvePaymentReservationIds(payment);
    if (reservationIds.length === 0) {
      return [];
    }

    const reservations = await this.reservationRepository.findByIds(reservationIds);
    const items = reservations.flatMap((reservation) =>
      reservation.items.map((item) => ReservationItemOutput.fromDomain(item)),
    );

    return this.enrichReservationOutputs.enrichItems(items);
  }

  async resolveForPayments(
    payments: Payment[],
  ): Promise<Map<number, ReservationItemOutput[]>> {
    const reservationIds = [
      ...new Set(payments.flatMap((payment) => resolvePaymentReservationIds(payment))),
    ];

    if (reservationIds.length === 0) {
      return new Map();
    }

    const reservations = await this.reservationRepository.findByIds(reservationIds);
    const enrichedReservations = await this.enrichReservationOutputs.enrich(
      reservations.map((reservation) => ReservationOutput.fromDomain(reservation)),
    );

    const itemsByReservationId = new Map<number, ReservationItemOutput[]>();
    for (const reservation of enrichedReservations) {
      itemsByReservationId.set(reservation.id, reservation.items);
    }

    const grouped = new Map<number, ReservationItemOutput[]>();

    for (const payment of payments) {
      const items = resolvePaymentReservationIds(payment).flatMap(
        (reservationId) => itemsByReservationId.get(reservationId) ?? [],
      );

      if (payment.id) {
        grouped.set(payment.id, items);
      }
    }

    return grouped;
  }
}
