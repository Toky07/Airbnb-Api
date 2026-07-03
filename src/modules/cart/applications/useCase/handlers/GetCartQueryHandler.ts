import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { GetCartQuery } from '../queries/GetCartQuery';
import type { CartOutput } from '../../dto/cart.output';
import type { CartPresenter } from '../../presenters/cart.presenter';
import type { ResolveCartService } from '../../services/resolve-cart.service';

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
