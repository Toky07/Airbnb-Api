import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import { CartItem } from '../../domain/entities/cart-item.entity';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import type { UpdateCartItemDto } from '../dto/add-cart-item.dto';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly calculateStayAmount: CalculateStayAmountService,
  ) {}

  async execute(
    context: CartRequestContext,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(context);
    const item = cart.items.find((entry) => entry.id === Number(itemId));

    if (!item?.id || !cart.id) {
      throw new NotFoundException('Article introuvable.');
    }

    let updated = item;

    if (item.itemType === CART_ITEM_TYPE.SERVICE) {
      const quantity = dto.quantity ?? item.quantity;
      updated = new CartItem(
        item.itemType,
        item.label,
        item.unitPrice,
        Number((item.unitPrice * quantity).toFixed(2)),
        quantity,
        item.propertyId,
        item.roomId,
        item.serviceId,
        item.startDate,
        item.endDate,
        item.guestCount,
        item.nights,
        item.id,
        item.cartId,
        item.createdAt,
        item.updatedAt,
      );
    } else if (item.itemType === CART_ITEM_TYPE.RESERVATION) {
      updated = await this.updateReservationItem(item, dto);
    }

    await this.cartRepository.updateItem(updated);
    const reloaded = await this.cartRepository.findById(cart.id);
    return CartPresenter.toOutput(reloaded!);
  }

  private async updateReservationItem(
    item: CartItem,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    if (!item.roomId) {
      throw new BadRequestException('Article de réservation invalide.');
    }

    const room = await this.roomRepository.findById(item.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const startDate = dto.startDate ?? item.startDate!;
    const endDate = dto.endDate ?? item.endDate!;
    const guestCount = dto.guestCount ?? item.guestCount!;

    if (guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayAmount = this.calculateStayAmount.execute({
      checkIn: startDate,
      checkOut: endDate,
      pricePerNight: room.pricePerNight,
    });

    return new CartItem(
      item.itemType,
      item.label,
      room.pricePerNight,
      stayAmount.amountInMajorUnit,
      1,
      item.propertyId,
      item.roomId,
      item.serviceId,
      startDate,
      endDate,
      guestCount,
      stayAmount.nights,
      item.id,
      item.cartId,
      item.createdAt,
      item.updatedAt,
    );
  }
}
