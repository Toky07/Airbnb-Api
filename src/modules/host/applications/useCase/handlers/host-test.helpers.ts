import { vi } from 'vitest';
import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { PropertyOutput } from '../../../../properties/applications/dto/property.output';
import type { PropertyMediaPresenter } from '../../../../properties/applications/presenters/property-media.presenter';

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
