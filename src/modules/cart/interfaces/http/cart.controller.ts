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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { Public } from '@src/modules/authentication/contracts';
import { CompleteCartCheckoutDto } from '@src/modules/cart/applications/dto/complete-cart-checkout.dto';
import { AddCartItemDto } from '@src/modules/cart/applications/dto/add-cart-item.dto';
import { UpdateCartItemDto } from '@src/modules/cart/applications/dto/update-cart-item.dto';
import { parseCartContext } from './parse-cart-context';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { GetCartQuery } from '@src/modules/cart/applications/useCase/queries/GetCartQuery';
import { AddCartItemCommand } from '@src/modules/cart/applications/useCase/commands/AddCartItemCommand';
import { UpdateCartItemCommand } from '@src/modules/cart/applications/useCase/commands/UpdateCartItemCommand';
import { RemoveCartItemCommand } from '@src/modules/cart/applications/useCase/commands/RemoveCartItemCommand';
import { MergeCartCommand } from '@src/modules/cart/applications/useCase/commands/MergeCartCommand';
import { CheckoutCartCommand } from '@src/modules/cart/applications/useCase/commands/CheckoutCartCommand';
import { CompleteCartCheckoutCommand } from '@src/modules/cart/applications/useCase/commands/CompleteCartCheckoutCommand';
import {
  ApiCartSessionHeader,
  ApiJwtAuth,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.CART)
@Controller('cart')
export class CartController {
  @Get()
  @Public()
  @ApiCartSessionHeader()
  @ApiOperation({ summary: 'Contenu du panier (anonyme ou connecté)' })
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
  @ApiCartSessionHeader()
  @ApiOperation({ summary: 'Ajouter un article au panier' })
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
  @ApiCartSessionHeader()
  @ApiOperation({ summary: 'Modifier un article du panier' })
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
  @ApiCartSessionHeader()
  @ApiOperation({ summary: 'Retirer un article du panier' })
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
  @ApiJwtAuth()
  @ApiCartSessionHeader()
  @ApiOperation({
    summary: 'Fusionner le panier anonyme avec le compte connecté',
  })
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
  @ApiJwtAuth()
  @ApiCartSessionHeader()
  @ApiOperation({
    summary:
      'Démarrer le checkout — crée réservation pending + PaymentIntent Stripe',
  })
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
  @ApiJwtAuth()
  @ApiCartSessionHeader()
  @ApiOperation({ summary: 'Finaliser le checkout après paiement Stripe' })
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
