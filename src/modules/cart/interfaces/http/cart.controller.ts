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
import {
  AddCartItemDto,
  UpdateCartItemDto,
} from '../../applications/dto/add-cart-item.dto';
import { parseCartContext } from './parse-cart-context';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { GetCartQuery } from '../../applications/useCase/queries/GetCartQuery';
import { AddCartItemCommand } from '../../applications/useCase/commands/AddCartItemCommand';
import { UpdateCartItemCommand } from '../../applications/useCase/commands/UpdateCartItemCommand';
import { RemoveCartItemCommand } from '../../applications/useCase/commands/RemoveCartItemCommand';
import { MergeCartCommand } from '../../applications/useCase/commands/MergeCartCommand';
import { CheckoutCartCommand } from '../../applications/useCase/commands/CheckoutCartCommand';
import { CompleteCartCheckoutCommand } from '../../applications/useCase/commands/CompleteCartCheckoutCommand';

@Controller('cart')
export class CartController {
  @Get()
  @Public()
  get(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
  ) {
    return QueryBus.execute(new GetCartQuery(parseCartContext(request)));
  }

  @Post('items')
  @Public()
  addItem(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
    @Body() dto: AddCartItemDto,
  ) {
    return CommandBus.execute(
      new AddCartItemCommand(parseCartContext(request), dto),
    );
  }

  @Patch('items/:id')
  @Public()
  updateItem(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
    @Param('id') id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return CommandBus.execute(
      new UpdateCartItemCommand(parseCartContext(request), Number(id), dto),
    );
  }

  @Delete('items/:id')
  @Public()
  removeItem(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
    @Param('id') id: number,
  ) {
    return CommandBus.execute(
      new RemoveCartItemCommand(parseCartContext(request), Number(id)),
    );
  }

  @Post('merge')
  merge(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
  ) {
    const context = parseCartContext(request);
    return CommandBus.execute(
      new MergeCartCommand(request.user!.sub, context.sessionId),
    );
  }

  @Post('checkout')
  checkout(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
  ) {
    return CommandBus.execute(
      new CheckoutCartCommand(request.user!.sub, parseCartContext(request)),
    );
  }

  @Post('checkout/complete')
  completeCheckout(
    @Req()
    request: {
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
    },
    @Body() dto: CompleteCartCheckoutDto,
  ) {
    return CommandBus.execute(
      new CompleteCartCheckoutCommand(
        request.user!.sub,
        dto.paymentId,
        parseCartContext(request),
      ),
    );
  }
}
