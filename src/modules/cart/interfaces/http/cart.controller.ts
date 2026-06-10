import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { CompleteCartCheckoutDto } from '../../applications/dto/complete-cart-checkout.dto';
import { AddCartItemDto, UpdateCartItemDto } from '../../applications/dto/add-cart-item.dto';
import { AddCartItemUseCase } from '../../applications/useCase/add-cart-item.usecase';
import { CheckoutCartUseCase } from '../../applications/useCase/checkout-cart.usecase';
import { CompleteCartCheckoutUseCase } from '../../applications/useCase/complete-cart-checkout.usecase';
import { ClearCartUseCase } from '../../applications/useCase/clear-cart.usecase';
import { GetCartUseCase } from '../../applications/useCase/get-cart.usecase';
import { MergeCartUseCase } from '../../applications/useCase/merge-cart.usecase';
import { RemoveCartItemUseCase } from '../../applications/useCase/remove-cart-item.usecase';
import { UpdateCartItemUseCase } from '../../applications/useCase/update-cart-item.usecase';
import { parseCartContext } from './parse-cart-context';

@Controller('cart')
export class CartController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly mergeCartUseCase: MergeCartUseCase,
    private readonly checkoutCartUseCase: CheckoutCartUseCase,
    private readonly completeCartCheckoutUseCase: CompleteCartCheckoutUseCase,
  ) {}

  @Get()
  @Public()
  get(@Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> }) {
    return this.getCartUseCase.execute(parseCartContext(request));
  }

  @Post('items')
  @Public()
  addItem(
    @Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> },
    @Body() dto: AddCartItemDto,
  ) {
    return this.addCartItemUseCase.execute(parseCartContext(request), dto);
  }

  @Patch('items/:id')
  @Public()
  updateItem(
    @Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> },
    @Param('id') id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.updateCartItemUseCase.execute(
      parseCartContext(request),
      Number(id),
      dto,
    );
  }

  @Delete('items/:id')
  @Public()
  removeItem(
    @Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> },
    @Param('id') id: number,
  ) {
    return this.removeCartItemUseCase.execute(parseCartContext(request), Number(id));
  }

  @Delete()
  @Public()
  clear(@Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> }) {
    return this.clearCartUseCase.execute(parseCartContext(request));
  }

  @Post('merge')
  merge(@Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> }) {
    const context = parseCartContext(request);
    return this.mergeCartUseCase.execute(request.user!.sub, context.sessionId);
  }

  @Post('checkout')
  checkout(
    @Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> },
  ) {
    return this.checkoutCartUseCase.execute(
      request.user!.sub,
      parseCartContext(request),
    );
  }

  @Post('checkout/complete')
  completeCheckout(
    @Req() request: { user?: JwtPayload; headers: Record<string, string | string[] | undefined> },
    @Body() dto: CompleteCartCheckoutDto,
  ) {
    return this.completeCartCheckoutUseCase.execute(
      request.user!.sub,
      dto.paymentId,
      parseCartContext(request),
    );
  }
}
