import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { hasPermission } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { CreateReservationDto } from '@src/modules/reservation/applications/dto/create-reservation.dto';
import { parseReservationQuery } from './parse-reservation-query';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateReservationCommand } from '@src/modules/reservation/applications/useCase/commands/CreateReservationCommand';
import { CancelReservationCommand } from '@src/modules/reservation/applications/useCase/commands/CancelReservationCommand';
import { GetReservationQuery } from '@src/modules/reservation/applications/useCase/queries/GetReservationQuery';
import { ListMyReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListMyReservationsQuery';
import { ListHostBookingOrdersQuery } from '@src/modules/reservation/applications/useCase/queries/ListHostBookingOrdersQuery';
import { ListHostReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListHostReservationsQuery';
import { GetReservationStatsQuery } from '@src/modules/reservation/applications/useCase/queries/GetReservationStatsQuery';
import { ListBookingOrdersQuery } from '@src/modules/reservation/applications/useCase/queries/ListBookingOrdersQuery';
import { GetBookingOrderQuery } from '@src/modules/reservation/applications/useCase/queries/GetBookingOrderQuery';
import { GetCancellationPreviewQuery } from '@src/modules/reservation/applications/useCase/queries/GetCancellationPreviewQuery';
import { ListReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListReservationsQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.RESERVATIONS)
@ApiJwtAuth()
@Controller('reservations')
export class ReservationController {
  @Post()
  @RequirePermissions('reservations.create')
  @ApiOperation({ summary: 'Créer une réservation (admin / direct)' })
  create(
    @Req() request: { user?: JwtPayload },
    @Body() dto: CreateReservationDto,
  ) {
    return CommandBus.execute(
      new CreateReservationCommand(request.user!.sub, [dto]),
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes réservations (voyageur)' })
  @ApiPaginationQuery()
  listMine(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return QueryBus.execute(
      new ListMyReservationsQuery(
        request.user!.sub,
        parseReservationQuery(query),
      ),
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques réservations (scope selon permissions)',
  })
  stats(@Req() request: { user?: JwtPayload }) {
    const user = request.user!;

    return QueryBus.execute(
      new GetReservationStatsQuery(user.sub, {
        canReadAll: hasPermission(user, ['reservations.read']),
        canReadHost: hasPermission(user, ['host.reservations.read']),
      }),
    );
  }

  @Get('bookings/host')
  @RequirePermissions('host.reservations.read')
  @ApiOperation({ summary: 'Commandes de réservation côté hôte' })
  @ApiPaginationQuery()
  listBookingOrdersForHost(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return QueryBus.execute(
      new ListHostBookingOrdersQuery(
        request.user!.sub,
        parseReservationQuery(query),
      ),
    );
  }

  @Get('bookings')
  @RequirePermissions('reservations.read')
  @ApiOperation({ summary: 'Commandes de réservation (admin)' })
  @ApiPaginationQuery()
  listBookingOrders(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(
      new ListBookingOrdersQuery(parseReservationQuery(query)),
    );
  }

  @Get('bookings/:paymentId')
  @ApiOperation({ summary: "Détail d'une commande par ID paiement" })
  getBookingOrder(
    @Req() request: { user?: JwtPayload },
    @Param('paymentId') paymentId: string,
  ) {
    const user = request.user!;
    const parsedPaymentId = Number.parseInt(paymentId, 10);

    return QueryBus.execute(
      new GetBookingOrderQuery(parsedPaymentId, {
        authId: user.sub,
        canReadAll: hasPermission(user, ['reservations.read']),
        canReadHost: hasPermission(user, ['host.reservations.read']),
      }),
    );
  }

  @Get('host')
  @RequirePermissions('host.reservations.read')
  @ApiOperation({ summary: "Réservations de l'établissement hôte" })
  @ApiPaginationQuery()
  listForHost(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return QueryBus.execute(
      new ListHostReservationsQuery(
        request.user!.sub,
        parseReservationQuery(query),
      ),
    );
  }

  @Get()
  @RequirePermissions('reservations.read')
  @ApiOperation({ summary: 'Liste des réservations (admin)' })
  @ApiPaginationQuery()
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(
      new ListReservationsQuery(parseReservationQuery(query)),
    );
  }

  @Post('me/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Annuler sa propre réservation (voyageur)' })
  cancelMine(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return CommandBus.execute(
      new CancelReservationCommand(parsedId, {
        authId: user.sub,
        canCancelAll: false,
        canCancelHost: false,
      }),
    );
  }

  @Get(':id/cancellation-preview')
  @ApiOperation({ summary: 'Aperçu remboursement avant annulation' })
  cancellationPreview(
    @Req() request: { user?: JwtPayload },
    @Param('id') id: string,
  ) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return QueryBus.execute(
      new GetCancellationPreviewQuery(parsedId, {
        authId: user.sub,
        canReadAll: hasPermission(user, ['reservations.read']),
        canReadHost: hasPermission(user, ['host.reservations.read']),
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une réservation" })
  getById(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return QueryBus.execute(
      new GetReservationQuery(parsedId, {
        authId: user.sub,
        canReadAll: hasPermission(user, ['reservations.read']),
        canReadHost: hasPermission(user, ['host.reservations.read']),
      }),
    );
  }

  @Post('cancel/:id')
  @RequirePermissions('reservations.cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Annuler une réservation (admin)' })
  cancel(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return CommandBus.execute(
      new CancelReservationCommand(parsedId, {
        authId: user.sub,
        canCancelAll: hasPermission(user, ['reservations.cancel']),
        canCancelHost: hasPermission(user, ['host.reservations.cancel']),
      }),
    );
  }
}
