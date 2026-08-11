import { Inject, Injectable } from '@nestjs/common';
import type { Payment } from '@src/modules/payment/contracts';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '@src/modules/reservation/domain/repositories/reservation.repository';
import { ReservationItemOutput } from '@src/modules/reservation/applications/dto/reservation-item.output';
import { BookingOrderItemOutput } from '@src/modules/reservation/applications/dto/booking-order-item.output';
import { resolvePaymentReservationIds } from '@src/modules/reservation/applications/dto/resolve-payment-reservation-ids';
import { EnrichReservationOutputsService } from './enrich-reservation-outputs.service';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';

@Injectable()
export class ResolvePaymentReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async resolveForPayment(payment: Payment): Promise<ReservationItemOutput[]> {
    const reservationIds = await this.resolveReservationIdsForPayment(payment);
    if (reservationIds.length === 0) {
      return [];
    }

    const reservations =
      await this.reservationRepository.findByIds(reservationIds);
    const items = reservations.flatMap((reservation) =>
      reservation.items.map((item) => ReservationItemOutput.fromDomain(item)),
    );

    return this.enrichReservationOutputs.enrichItems(items);
  }

  async resolveBookingItemsForPayment(
    payment: Payment,
  ): Promise<BookingOrderItemOutput[]> {
    const reservationIds = await this.resolveReservationIdsForPayment(payment);
    if (reservationIds.length === 0) {
      return [];
    }

    const reservations =
      await this.reservationRepository.findByIds(reservationIds);
    const enrichedReservations = await this.enrichReservationOutputs.enrich(
      reservations.map((reservation) =>
        ReservationOutput.fromDomain(reservation),
      ),
    );

    return enrichedReservations.flatMap((reservation) =>
      reservation.items.map((item) =>
        BookingOrderItemOutput.fromReservationItem(item, {
          userId: reservation.userId,
          status: reservation.status,
        }),
      ),
    );
  }

  async resolveForPayments(
    payments: Payment[],
  ): Promise<Map<number, BookingOrderItemOutput[]>> {
    const reservationIdsByPaymentId = new Map<number, number[]>();

    await Promise.all(
      payments.map(async (payment) => {
        if (!payment.id) {
          return;
        }

        reservationIdsByPaymentId.set(
          payment.id,
          await this.resolveReservationIdsForPayment(payment),
        );
      }),
    );

    const reservationIds = [
      ...new Set([...reservationIdsByPaymentId.values()].flatMap((ids) => ids)),
    ];

    if (reservationIds.length === 0) {
      return new Map();
    }

    const reservations =
      await this.reservationRepository.findByIds(reservationIds);
    const enrichedReservations = await this.enrichReservationOutputs.enrich(
      reservations.map((reservation) =>
        ReservationOutput.fromDomain(reservation),
      ),
    );

    const itemsByReservationId = new Map<number, BookingOrderItemOutput[]>();
    for (const reservation of enrichedReservations) {
      itemsByReservationId.set(
        reservation.id,
        reservation.items.map((item) =>
          BookingOrderItemOutput.fromReservationItem(item, {
            userId: reservation.userId,
            status: reservation.status,
          }),
        ),
      );
    }

    const grouped = new Map<number, BookingOrderItemOutput[]>();

    for (const payment of payments) {
      const items =
        (payment.id ? reservationIdsByPaymentId.get(payment.id) : [])?.flatMap(
          (reservationId) => itemsByReservationId.get(reservationId) ?? [],
        ) ?? [];

      if (payment.id) {
        grouped.set(payment.id, items);
      }
    }

    return grouped;
  }

  private async resolveReservationIdsForPayment(
    payment: Payment,
  ): Promise<number[]> {
    const reservationIds = resolvePaymentReservationIds(payment);
    if (reservationIds.length > 0 || !payment.id) {
      return reservationIds;
    }

    const reservation = await this.reservationRepository.findByPaymentId(
      payment.id,
    );
    return reservation?.id ? [reservation.id] : [];
  }
}
