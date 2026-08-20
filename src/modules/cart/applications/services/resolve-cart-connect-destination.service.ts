import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import type { Cart } from '@src/modules/cart/domain/entities/cart.entity';
import type { CartConnectDestination } from '@src/modules/cart/domain/types/cart-connect-destination';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '@src/modules/rooms/contracts';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@src/modules/user/contracts';

@Injectable()
export class ResolveCartConnectDestinationService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async resolveFromCart(cart: Cart): Promise<CartConnectDestination> {
    const ownerIds = new Set<number>();

    for (const item of cart.items) {
      if (item.itemType !== CART_ITEM_TYPE.RESERVATION || !item.roomId) {
        continue;
      }

      const room = await this.roomRepository.findById(item.roomId);
      const ownerId = room?.property?.ownerId;
      if (!ownerId) {
        throw new BadRequestException(
          'Impossible de déterminer l’hôte de cet article.',
        );
      }
      ownerIds.add(ownerId);
    }

    if (ownerIds.size === 0) {
      throw new BadRequestException('Aucun article payable dans le panier.');
    }

    if (ownerIds.size > 1) {
      throw new BadRequestException(
        'Votre panier contient des logements de plusieurs hôtes. Payez-les séparément.',
      );
    }

    const hostUserId = [...ownerIds][0]!;
    const host = await this.userRepository.findById(hostUserId);

    if (!host?.stripeAccountId || !host.stripeChargesEnabled) {
      throw new BadRequestException(
        'Cet hôte n’a pas encore activé les paiements Stripe.',
      );
    }

    return {
      hostUserId,
      stripeAccountId: host.stripeAccountId,
    };
  }
}
