import { ForbiddenException } from '@nestjs/common';
import { vi } from 'vitest';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { Property } from '@src/modules/properties/contracts';
import { PropertyOutput } from '@src/modules/properties/contracts';
import type { PropertyMediaPresenter } from '@src/modules/properties/contracts';

export const authUser = { sub: 99 } as JwtPayload;

export const hostProperty = new Property({
  id: 1,
  name: 'Hôtel Azur',
  description: 'Description',
  address: '1 rue',
  city: 'Nice',
  country: 'France',
  latitude: 43.7,
  longitude: 7.2,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  ownerId: 5,
});

export const propertyOutput = PropertyOutput.fromDomain(hostProperty, null);

export function createResolveHostUserMock() {
  return {
    resolve: vi.fn().mockResolvedValue({
      id: 5,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phoneNumber: '+33612345678',
    }),
  };
}

export function createResolveHostPropertyMock() {
  return {
    listOwned: vi.fn().mockResolvedValue([hostProperty]),
    requireOwned: vi.fn().mockResolvedValue(hostProperty),
  };
}

export function createPropertyPresenterMock() {
  return {
    toOutput: vi.fn().mockResolvedValue(propertyOutput),
  } as unknown as PropertyMediaPresenter;
}

export function createAssertHostRoomOwnershipMock(reject = false) {
  return {
    assert: reject
      ? vi
          .fn()
          .mockRejectedValue(
            new ForbiddenException('Chambre introuvable ou accès refusé.'),
          )
      : vi.fn().mockResolvedValue(undefined),
  };
}
