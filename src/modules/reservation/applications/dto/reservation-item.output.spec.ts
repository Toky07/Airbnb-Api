import { describe, expect, it } from 'vitest';
import type { RoomProductSummary } from '@src/modules/rooms/contracts';
import { ReservationItemOutput } from './reservation-item.output';

const summary: RoomProductSummary = {
  roomName: 'Suite',
  roomSlug: 'suite',
  propertyId: 1,
  propertyName: 'Riviera',
  propertyCity: 'Nice',
  propertyAddress: '1 rue de la Plage',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  houseRules: 'Pas de fête',
  checkInInstructions: 'Boîte à clés 1234',
  wifiName: 'Riviera-Guest',
  wifiPassword: 'secret-wifi',
  emergencyContact: '06 00 00 00 00',
  imageUrl: null,
};

function emptyItem(): ReservationItemOutput {
  return new ReservationItemOutput(
    1,
    2,
    10,
    '2026-08-20',
    '2026-08-22',
    '2026-08-20',
    '2026-08-22',
    2,
    200,
    2,
    null,
    null,
    null,
    null,
    null,
    null,
    new Date('2026-08-01T00:00:00.000Z'),
    new Date('2026-08-01T00:00:00.000Z'),
    null,
  );
}

describe('ReservationItemOutput.enrich', () => {
  it('masque wifi et consignes d’entrée tant que le séjour n’est pas confirmé', () => {
    const guide = ReservationItemOutput.enrich(
      emptyItem(),
      summary,
      false,
    ).arrivalGuide;

    expect(guide?.houseRules).toBe('Pas de fête');
    expect(guide?.checkInInstructions).toBeNull();
    expect(guide?.wifiName).toBeNull();
    expect(guide?.wifiPassword).toBeNull();
  });

  it('expose le guide complet après confirmation', () => {
    const guide = ReservationItemOutput.enrich(
      emptyItem(),
      summary,
      true,
    ).arrivalGuide;

    expect(guide?.checkInInstructions).toBe('Boîte à clés 1234');
    expect(guide?.wifiName).toBe('Riviera-Guest');
    expect(guide?.wifiPassword).toBe('secret-wifi');
  });
});
