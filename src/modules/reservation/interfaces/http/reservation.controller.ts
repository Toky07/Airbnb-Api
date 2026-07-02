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
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { hasPermission } from '../../../authentication/domain/utils/build-jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { CreateReservationDto } from '../../applications/dto/create-reservation.dto';
import { parseReservationQuery } from './parse-reservation-query';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateReservationCommand } from '../../applications/useCase/commands/CreateReservationCommand';
import { CancelReservationCommand } from '../../applications/useCase/commands/CancelReservationCommand';
import { GetReservationQuery } from '../../applications/useCase/queries/GetReservationQuery';
import { ListMyReservationsQuery } from '../../applications/useCase/queries/ListMyReservationsQuery';
import { ListHostBookingOrdersQuery } from '../../applications/useCase/queries/ListHostBookingOrdersQuery';
import { ListHostReservationsQuery } from '../../applications/useCase/queries/ListHostReservationsQuery';
import { GetReservationStatsQuery } from '../../applications/useCase/queries/GetReservationStatsQuery';
import { ListBookingOrdersQuery } from '../../applications/useCase/queries/ListBookingOrdersQuery';
import { GetBookingOrderQuery } from '../../applications/useCase/queries/GetBookingOrderQuery';
import { ListReservationsQuery } from '../../applications/useCase/queries/ListReservationsQuery';

@Controller('reservations')
export class ReservationController {
  @Post()
  create(
    @Req() request: { user?: JwtPayload },
    @Body() dto: CreateReservationDto,
  ) {
    return CommandBus.execute(
      new CreateReservationCommand(request.user!.sub, [dto]),
    );
  }

  @Get('me')
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
  listBookingOrders(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(
      new ListBookingOrdersQuery(parseReservationQuery(query)),
    );
  }

  @Get('bookings/:paymentId')
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
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(
      new ListReservationsQuery(parseReservationQuery(query)),
    );
  }

  @Get(':id')
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
  cancel(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return CommandBus.execute(
      new CancelReservationCommand(parsedId, {
        authId: user.sub,
        canCancelAll: hasPermission(user, ['reservations.cancel']),
        canCancelHost: hasPermission(user, ['host.reservations.read']),
      }),
    );
  }
}
