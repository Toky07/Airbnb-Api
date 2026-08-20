import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import { CartItem } from '@src/modules/cart/domain/entities/cart-item.entity';
import { Property } from '@src/modules/properties/contracts';
import { Room } from '@src/modules/rooms/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/contracts';
import {
  createSampleCart,
  createSampleCartItem,
} from '@src/modules/cart/applications/cart-test.helpers';
import { ResolveCartConnectDestinationService } from './resolve-cart-connect-destination.service';

function createRoom(id: number, ownerId: number): Room {
  return new Room({
    id,
    name: 'Suite',
    slug: `suite-${id}`,
    description: 'Desc',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 30,
    status: 'available',
    property: new Property({
      id: ownerId,
      name: 'Hotel',
      description: 'Desc',
      address: '1 rue',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId,
    }),
  });
}

function createOnboardedHost(id: number): User {
  const user = new User(
    new UserNameVO('Jean'),
    new UserNameVO('Hôte'),
    new EmailVO(`host-${id}@test.com`),
    new PhoneNumberVO('+33601020304'),
    '',
    id,
  );
  user.stripeAccountId = `acct_host_${id}`;
  user.stripeChargesEnabled = true;
  return user;
}

describe('ResolveCartConnectDestinationService', () => {
  it('retourne le compte Connect de l’hôte unique', async () => {
    const host = createOnboardedHost(7);
    const service = new ResolveCartConnectDestinationService(
      { findById: vi.fn().mockResolvedValue(createRoom(10, 7)) } as never,
      { findById: vi.fn().mockResolvedValue(host) } as never,
    );

    await expect(service.resolveFromCart(createSampleCart())).resolves.toEqual({
      hostUserId: 7,
      stripeAccountId: 'acct_host_7',
    });
  });

  it('refuse un panier multi-hôtes', async () => {
    const roomRepository = {
      findById: vi
        .fn()
        .mockResolvedValueOnce(createRoom(10, 7))
        .mockResolvedValueOnce(createRoom(11, 8)),
    };
    const service = new ResolveCartConnectDestinationService(
      roomRepository as never,
      { findById: vi.fn() } as never,
    );

    const cart = createSampleCart({
      items: [
        createSampleCartItem({ roomId: 10, id: 1 }),
        new CartItem(
          CART_ITEM_TYPE.RESERVATION,
          'Autre',
          80,
          80,
          1,
          4,
          11,
          null,
          '2026-08-01',
          '2026-08-02',
          1,
          1,
          2,
        ),
      ],
    });

    await expect(service.resolveFromCart(cart)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refuse un hôte non onboardé', async () => {
    const host = createOnboardedHost(7);
    host.stripeChargesEnabled = false;
    const service = new ResolveCartConnectDestinationService(
      { findById: vi.fn().mockResolvedValue(createRoom(10, 7)) } as never,
      { findById: vi.fn().mockResolvedValue(host) } as never,
    );

    await expect(
      service.resolveFromCart(createSampleCart()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
