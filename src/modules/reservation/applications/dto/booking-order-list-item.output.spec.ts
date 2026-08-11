import { describe, expect, it } from 'vitest';
import { createSamplePayment } from '@src/modules/payment/applications/useCase/payment-test.helpers';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User, UserNameVO } from '@src/modules/user/contracts';
import { BookingOrderItemOutput } from './booking-order-item.output';
import { BookingOrderListItemOutput } from './booking-order-list-item.output';

function createItem(
  overrides: Partial<{
    roomName: string | null;
    propertyName: string | null;
    propertyId: number | null;
    price: number;
    reservationId: number;
  }> = {},
): BookingOrderItemOutput {
  return new BookingOrderItemOutput(
    1,
    overrides.reservationId ?? 10,
    20,
    5,
    '2026-07-01',
    '2026-07-03',
    '2026-07-01',
    '2026-07-03',
    2,
    overrides.price ?? 100,
    2,
    RESERVATION_STATUS.CONFIRMED,
    overrides.roomName === undefined ? 'Suite' : overrides.roomName,
    'suite',
    overrides.propertyId === undefined ? 3 : overrides.propertyId,
    overrides.propertyName === undefined ? 'Hotel' : overrides.propertyName,
    'Paris',
    null,
    new Date('2026-06-01T10:00:00.000Z'),
    new Date('2026-06-01T10:00:00.000Z'),
  );
}

describe('BookingOrderListItemOutput.fromParts', () => {
  const payment = createSamplePayment({ id: 9 });

  it('affiche « Aucun séjour » sans items', () => {
    const output = BookingOrderListItemOutput.fromParts(payment, [], null);

    expect(output.previewLabel).toBe('Aucun séjour');
    expect(output.customerName).toBe('Client inconnu');
    expect(output.customerEmail).toBe('—');
    expect(output.amount).toBe(0);
  });

  it('construit le label et le client pour un item complet', () => {
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const output = BookingOrderListItemOutput.fromParts(
      payment,
      [createItem()],
      user,
    );

    expect(output.previewLabel).toBe('Suite · Hotel');
    expect(output.customerName).toBe('Jean Dupont');
    expect(output.customerEmail).toBe('jean@test.com');
    expect(output.amount).toBe(100);
    expect(output.propertyId).toBe(3);
  });

  it('utilise le fallback chambre quand le nom établissement manque', () => {
    const output = BookingOrderListItemOutput.fromParts(
      payment,
      [createItem({ propertyName: null, roomName: 'Loft' })],
      null,
    );

    expect(output.previewLabel).toBe('Loft');
  });

  it('ajoute « (+1 autre) » puis « (+N autres) »', () => {
    const two = BookingOrderListItemOutput.fromParts(
      payment,
      [createItem({ price: 50 }), createItem({ price: 70 })],
      null,
    );
    const three = BookingOrderListItemOutput.fromParts(
      payment,
      [
        createItem({ price: 10 }),
        createItem({ price: 20 }),
        createItem({ price: 30 }),
      ],
      null,
    );

    expect(two.previewLabel).toBe('Suite · Hotel (+1 autre)');
    expect(two.amount).toBe(120);
    expect(three.previewLabel).toBe('Suite · Hotel (+2 autres)');
    expect(three.amount).toBe(60);
  });

  it('priorise propertyId du scope', () => {
    const output = BookingOrderListItemOutput.fromParts(
      payment,
      [createItem({ propertyId: 3 })],
      null,
      { propertyId: 99 },
    );

    expect(output.propertyId).toBe(99);
  });
});
