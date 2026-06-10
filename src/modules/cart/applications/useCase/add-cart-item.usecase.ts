import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import type { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';
import { BuildCartItemService } from '../services/build-cart-item.service';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class AddCartItemUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly buildCartItemService: BuildCartItemService,
  ) {}

  async execute(
    context: CartRequestContext,
    dto: AddCartItemDto,
  ): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(context);
    const item = await this.buildCartItemService.fromDto(dto);

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

    return CartPresenter.toOutput(reloaded);
  }
}
