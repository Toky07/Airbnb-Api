import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { AddCartItemCommand } from '@src/modules/cart/applications/useCase/commands/AddCartItemCommand';
import type { CartOutput } from '@src/modules/cart/applications/dto/cart.output';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import type { ICartRepository } from '@src/modules/cart/domain/repositories/cart.repository';
import type { BuildCartItemService } from '@src/modules/cart/applications/services/build-cart-item.service';
import type { CartPresenter } from '@src/modules/cart/applications/presenters/cart.presenter';
import type { ResolveCartService } from '@src/modules/cart/applications/services/resolve-cart.service';

export class AddCartItemCommandHandler implements ICommandHandler<
  AddCartItemCommand,
  CartOutput
> {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly cartRepository: ICartRepository,
    private readonly buildCartItemService: BuildCartItemService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(command: AddCartItemCommand): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(command.context);
    const item = await this.buildCartItemService.fromDto(command.dto);

    if (
      item.itemType === CART_ITEM_TYPE.RESERVATION &&
      cart.items.some(
        (existing) =>
          existing.itemType === CART_ITEM_TYPE.RESERVATION &&
          existing.roomId === item.roomId &&
          existing.startDate === item.startDate &&
          existing.endDate === item.endDate,
      )
    ) {
      throw new BadRequestException('Cet article est déjà dans votre panier.');
    }

    if (!cart.id) {
      throw new NotFoundException('Panier introuvable.');
    }

    await this.cartRepository.addItem(cart.id, item);
    const reloaded = await this.cartRepository.findById(cart.id);

    if (!reloaded) {
      throw new NotFoundException('Panier introuvable.');
    }

    return this.cartPresenter.toOutput(reloaded);
  }
}
