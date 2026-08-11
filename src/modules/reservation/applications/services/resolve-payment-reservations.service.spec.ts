import { describe, expect, it, vi } from 'vitest';
import { PAYMENT_TYPE } from '@src/modules/payment/contracts';
import { createSamplePayment } from '@src/modules/payment/applications/useCase/payment-test.helpers';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '@src/modules/reservation/applications/useCase/reservation-test.helpers';
import { ResolvePaymentReservationsService } from './resolve-payment-reservations.service';

describe('ResolvePaymentReservationsService', () => {
  it('résout les items via propertyId pour un paiement réservation', async () => {
    const reservation = createSampleReservation({
      id: 42,
      items: [createSampleReservationItem({ id: 7, reservationId: 42 })],
    });
    const reservationRepository = createReservationRepositoryMock({
      findByIds: vi.fn().mockResolvedValue([reservation]),
    });
    const enrichReservationOutputs = {
      enrichItems: vi
        .fn()
        .mockImplementation(async (items: unknown[]) => items),
      enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
    };

    const service = new ResolvePaymentReservationsService(
      reservationRepository,
      enrichReservationOutputs as never,
    );

    const items = await service.resolveForPayment(
      createSamplePayment({ id: 9, propertyId: 42 }),
    );

    expect(reservationRepository.findByIds).toHaveBeenCalledWith([42]);
    expect(reservationRepository.findByPaymentId).not.toHaveBeenCalled();
    expect(enrichReservationOutputs.enrichItems).toHaveBeenCalled();
    expect(items).toHaveLength(1);
    expect(items[0]?.reservationId).toBe(42);
  });

  it('retombe sur findByPaymentId pour un paiement order', async () => {
    const reservation = createSampleReservation({ id: 15 });
    const reservationRepository = createReservationRepositoryMock({
      findByPaymentId: vi.fn().mockResolvedValue(reservation),
      findByIds: vi.fn().mockResolvedValue([reservation]),
    });
    const enrichReservationOutputs = {
      enrichItems: vi
        .fn()
        .mockImplementation(async (items: unknown[]) => items),
      enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
    };
    const payment = {
      ...createSamplePayment({ id: 9, propertyId: 99 }),
      propertyType: PAYMENT_TYPE.ORDER,
    };

    const service = new ResolvePaymentReservationsService(
      reservationRepository,
      enrichReservationOutputs as never,
    );

    await service.resolveForPayment(payment as never);

    expect(reservationRepository.findByPaymentId).toHaveBeenCalledWith(9);
    expect(reservationRepository.findByIds).toHaveBeenCalledWith([15]);
  });

  it('retourne une map vide quand aucun paiement n’a d’id', async () => {
    const service = new ResolvePaymentReservationsService(
      createReservationRepositoryMock(),
      {
        enrichItems: vi.fn(),
        enrich: vi.fn(),
      } as never,
    );

    const payment = createSamplePayment({ id: undefined as never });
    Object.assign(payment, { id: undefined });

    const grouped = await service.resolveForPayments([payment]);

    expect(grouped.size).toBe(0);
  });

  it('groupe les booking items par paiement', async () => {
    const reservation = createSampleReservation({
      id: 42,
      items: [createSampleReservationItem({ id: 7, reservationId: 42 })],
    });
    const reservationRepository = createReservationRepositoryMock({
      findByIds: vi.fn().mockResolvedValue([reservation]),
    });
    const enrichReservationOutputs = {
      enrichItems: vi.fn(),
      enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
    };
    const service = new ResolvePaymentReservationsService(
      reservationRepository,
      enrichReservationOutputs as never,
    );

    const payment = createSamplePayment({ id: 9, propertyId: 42 });
    const grouped = await service.resolveForPayments([payment]);

    expect(grouped.get(9)).toHaveLength(1);
    expect(grouped.get(9)?.[0]?.reservationId).toBe(42);
  });
});
