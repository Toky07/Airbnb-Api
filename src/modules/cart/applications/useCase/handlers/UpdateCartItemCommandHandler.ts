import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { UpdateCartItemCommand } from '@src/modules/cart/applications/useCase/commands/UpdateCartItemCommand';
import type { CartOutput } from '@src/modules/cart/applications/dto/cart.output';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import { CartItem } from '@src/modules/cart/domain/entities/cart-item.entity';
import type { ICartItemCatalogPort } from '@src/modules/cart/domain/ports/cart-item-catalog.port';
import type { ICartRepository } from '@src/modules/cart/domain/repositories/cart.repository';
import type { UpdateCartItemDto } from '@src/modules/cart/applications/dto/add-cart-item.dto';
import type { CartPresenter } from '@src/modules/cart/applications/presenters/cart.presenter';
import type { ResolveCartService } from '@src/modules/cart/applications/services/resolve-cart.service';

export class UpdateCartItemCommandHandler implements ICommandHandler<
  UpdateCartItemCommand,
  CartOutput
> {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly cartRepository: ICartRepository,
    private readonly cartItemCatalog: ICartItemCatalogPort,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(command: UpdateCartItemCommand): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(command.context);
    const item = cart.items.find(
      (entry) => entry.id === Number(command.itemId),
    );

    if (!item?.id || !cart.id) {
      throw new NotFoundException('Article introuvable.');
    }

    let updated = item;

    if (item.itemType === CART_ITEM_TYPE.SERVICE) {
      const quantity = command.dto.quantity ?? item.quantity;
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
      updated = await this.updateReservationItem(item, command.dto);
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
