import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { GetCartQuery } from '@src/modules/cart/applications/useCase/queries/GetCartQuery';
import type { CartOutput } from '@src/modules/cart/applications/dto/cart.output';
import type { CartPresenter } from '@src/modules/cart/applications/presenters/cart.presenter';
import type { ResolveCartService } from '@src/modules/cart/applications/services/resolve-cart.service';

export class GetCartQueryHandler implements IQueryHandler<
  GetCartQuery,
  CartOutput
> {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(query: GetCartQuery): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(query.context);
    return this.cartPresenter.toOutput(cart);
  }
}
