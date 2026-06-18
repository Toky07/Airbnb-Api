import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import { CartItem } from '../../domain/entities/cart-item.entity';
import {
  CART_ITEM_CATALOG_PORT,
  type ICartItemCatalogPort,
} from '../../domain/ports/cart-item-catalog.port';
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
    @Inject(CART_ITEM_CATALOG_PORT)
    private readonly cartItemCatalog: ICartItemCatalogPort,
    private readonly cartPresenter: CartPresenter,
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
    return this.cartPresenter.toOutput(reloaded!);
  }

  private async updateReservationItem(
    item: CartItem,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    if (!item.roomId) {
      throw new BadRequestException('Article de réservation invalide.');
    }

    const startDate = dto.startDate ?? item.startDate!;
    const endDate = dto.endDate ?? item.endDate!;
    const guestCount = dto.guestCount ?? item.guestCount!;

    const details = await this.cartItemCatalog.updateReservationItem({
      roomId: item.roomId,
      startDate,
      endDate,
      guestCount,
      currentLabel: item.label,
    });

    return new CartItem(
      item.itemType,
      details.label,
      details.unitPrice,
      details.totalPrice,
      1,
      details.propertyId,
      details.roomId,
      item.serviceId,
      startDate,
      endDate,
      guestCount,
      details.nights,
      item.id,
      item.cartId,
      item.createdAt,
      item.updatedAt,
    );
  }
}
