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
import type { JwtPayload } from '../../../authentication/contracts';
import { Public } from '../../../authentication/contracts';
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
import {
  ApiCartSessionHeader,
  ApiJwtAuth,
} from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

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
