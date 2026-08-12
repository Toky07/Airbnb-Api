import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentConfirmedEvent } from '@src/modules/payment/contracts';
import { createSamplePayment } from '@src/modules/payment/applications/useCase/payment-test.helpers';
import { EventBus } from '@src/shared/domain/event.bus';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';
import { PaymentConfirmedListener } from './payment-confirmed.listener';

describe('PaymentConfirmedListener', () => {
  beforeEach(() => {
    EventBus.getInstance().clear();
    vi.clearAllMocks();
  });

  it('ne fait rien sans payment dans le payload', async () => {
    const reservationRepository = {
      findByPaymentId: vi.fn(),
    };
    const buildReservationInvoicePayload = {
      execute: vi.fn(),
      toInvoiceGenerateEvent: vi.fn(),
    };

    const listener = new PaymentConfirmedListener(
      reservationRepository as never,
      buildReservationInvoicePayload as never,
    );
    await listener.listen();

    await EventBus.getInstance().publish({
      eventName: 'payment.confirmed',
      occurredOn: new Date(),
      payment: undefined,
    } as never);

    expect(reservationRepository.findByPaymentId).not.toHaveBeenCalled();
  });

  it('confirme la réservation et publie la facture', async () => {
    const payment = createSamplePayment({ id: 55 });
    const reservationRepository = {
      findByPaymentId: vi.fn().mockResolvedValue({ id: 10 }),
    };
    const invoiceEvent = {
      eventName: 'invoice.generate',
      occurredOn: new Date(),
    };
    const buildReservationInvoicePayload = {
      execute: vi.fn().mockResolvedValue({ customerEmail: 'a@test.com' }),
      toInvoiceGenerateEvent: vi.fn().mockReturnValue(invoiceEvent),
    };
    const publishSpy = vi.spyOn(EventBus.getInstance(), 'publish');

    const listener = new PaymentConfirmedListener(
      reservationRepository as never,
      buildReservationInvoicePayload as never,
    );
    await listener.listen();

    await EventBus.getInstance().publish(new PaymentConfirmedEvent(payment));

    expect(reservationRepository.findByPaymentId).toHaveBeenCalledWith(55);
    expect(commandBusExecuteMock).toHaveBeenCalled();
    expect(buildReservationInvoicePayload.execute).toHaveBeenCalledWith(
      payment,
    );
    expect(publishSpy).toHaveBeenCalledWith(invoiceEvent);
  });

  it('ne publie pas de facture si le contexte est null', async () => {
    const payment = createSamplePayment({ id: 55 });
    const reservationRepository = {
      findByPaymentId: vi.fn().mockResolvedValue({ id: 10 }),
    };
    const buildReservationInvoicePayload = {
      execute: vi.fn().mockResolvedValue(null),
      toInvoiceGenerateEvent: vi.fn(),
    };

    const listener = new PaymentConfirmedListener(
      reservationRepository as never,
      buildReservationInvoicePayload as never,
    );
    await listener.listen();

    await EventBus.getInstance().publish(new PaymentConfirmedEvent(payment));

    expect(commandBusExecuteMock).toHaveBeenCalled();
    expect(
      buildReservationInvoicePayload.toInvoiceGenerateEvent,
    ).not.toHaveBeenCalled();
  });

  it('lève une erreur si la réservation est introuvable', async () => {
    const payment = createSamplePayment({ id: 55 });
    const listener = new PaymentConfirmedListener(
      {
        findByPaymentId: vi.fn().mockResolvedValue(null),
      } as never,
      {
        execute: vi.fn(),
        toInvoiceGenerateEvent: vi.fn(),
      } as never,
    );
    await listener.listen();

    await expect(
      EventBus.getInstance().publish(new PaymentConfirmedEvent(payment)),
    ).rejects.toThrow('Reservation not found');
  });
});
