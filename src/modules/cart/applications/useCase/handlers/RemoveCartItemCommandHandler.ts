import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { RemoveCartItemCommand } from '../commands/RemoveCartItemCommand';
import type { CartOutput } from '../../dto/cart.output';
import type { ICartRepository } from '../../../domain/repositories/cart.repository';
import type { CartPresenter } from '../../presenters/cart.presenter';
import type { ResolveCartService } from '../../services/resolve-cart.service';

export class RemoveCartItemCommandHandler
  implements ICommandHandler<RemoveCartItemCommand, CartOutput>
{
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly cartRepository: ICartRepository,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(command: RemoveCartItemCommand): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(command.context);
    const item = cart.items.find((entry) => entry.id === Number(command.itemId));

    if (!item?.id || !cart.id) {
      throw new NotFoundException('Article introuvable.');
    }

    await this.cartRepository.removeItem(item.id);
    const reloaded = await this.cartRepository.findById(cart.id);
    return this.cartPresenter.toOutput(reloaded!);
  }
}
