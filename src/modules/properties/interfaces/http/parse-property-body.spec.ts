import { describe, expect, it } from 'vitest';
import { parsePropertyBody } from './parse-property-body';

describe('parsePropertyBody', () => {
  it('parse le guide d’arrivée', () => {
    const dto = parsePropertyBody({
      name: 'Loft',
      description: 'Centre ville',
      address: '1 rue Test',
      city: 'Lyon',
      country: 'France',
      latitude: 45.75,
      longitude: 4.85,
      checkInTime: '16:00',
      checkOutTime: '10:00',
      ownerId: 8,
      houseRules: ' Pas de fête ',
      wifiName: 'Loft-Guest',
      wifiPassword: 'secret',
      checkInInstructions: 'Boîte à clés',
      emergencyContact: '+33601020304',
    });

    expect(dto.houseRules).toBe('Pas de fête');
    expect(dto.wifiName).toBe('Loft-Guest');
    expect(dto.wifiPassword).toBe('secret');
    expect(dto.checkInInstructions).toBe('Boîte à clés');
    expect(dto.emergencyContact).toBe('+33601020304');
  });

  it('laisse le guide vide si absent', () => {
    const dto = parsePropertyBody({
      name: 'Loft',
      description: 'Centre ville',
      address: '1 rue Test',
      city: 'Lyon',
      country: 'France',
      latitude: 45.75,
      longitude: 4.85,
      checkInTime: '16:00',
      checkOutTime: '10:00',
      ownerId: 8,
    });

    expect(dto.houseRules).toBe('');
    expect(dto.wifiName).toBe('');
    expect(dto.wifiPassword).toBe('');
  });
});
