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
import { CancelReservationUseCase } from '../../applications/useCase/cancel-reservation.usecase';
import { CreateReservationUseCase } from '../../applications/useCase/create-reservation.usecase';
import { GetReservationUseCase } from '../../applications/useCase/get-reservation.usecase';
import { ListHostReservationsUseCase } from '../../applications/useCase/list-host-reservations.usecase';
import { ListMyReservationsUseCase } from '../../applications/useCase/list-my-reservations.usecase';
import { ListReservationsUseCase } from '../../applications/useCase/list-reservations.usecase';
import { GetReservationStatsUseCase } from '../../applications/useCase/get-reservation-stats.usecase';
import { GetBookingOrderUseCase } from '../../applications/useCase/get-booking-order.usecase';
import { ListBookingOrdersUseCase } from '../../applications/useCase/list-booking-orders.usecase';
import { ListHostBookingOrdersUseCase } from '../../applications/useCase/list-host-booking-orders.usecase';
import { parseReservationQuery } from './parse-reservation-query';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly listMyReservationsUseCase: ListMyReservationsUseCase,
    private readonly listHostReservationsUseCase: ListHostReservationsUseCase,
    private readonly getReservationStatsUseCase: GetReservationStatsUseCase,
    private readonly listBookingOrdersUseCase: ListBookingOrdersUseCase,
    private readonly listHostBookingOrdersUseCase: ListHostBookingOrdersUseCase,
    private readonly getBookingOrderUseCase: GetBookingOrderUseCase,
    private readonly getReservationUseCase: GetReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
  ) {}

  @Post()
  create(
    @Req() request: { user?: JwtPayload },
    @Body() dto: CreateReservationDto,
  ) {
    return this.createReservationUseCase.execute(request.user!.sub, [dto]);
  }

  @Get('me')
  listMine(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return this.listMyReservationsUseCase.execute(
      request.user!.sub,
      parseReservationQuery(query),
    );
  }

  @Get('stats')
  stats(@Req() request: { user?: JwtPayload }) {
    const user = request.user!;

    return this.getReservationStatsUseCase.execute(user.sub, {
      canReadAll: hasPermission(user, ['reservations.read']),
      canReadHost: hasPermission(user, ['host.reservations.read']),
    });
  }

  @Get('bookings/host')
  @RequirePermissions('host.reservations.read')
  listBookingOrdersForHost(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return this.listHostReservationsUseCase.execute(
      request.user!.sub,
      parseReservationQuery(query),
    );
  }

  @Get('bookings')
  @RequirePermissions('reservations.read')
  listBookingOrders(@Query() query: Record<string, unknown>) {
    return this.listBookingOrdersUseCase.execute(parseReservationQuery(query));
  }

  @Get('bookings/:paymentId')
  getBookingOrder(
    @Req() request: { user?: JwtPayload },
    @Param('paymentId') paymentId: string,
  ) {
    const user = request.user!;
    const parsedPaymentId = Number.parseInt(paymentId, 10);

    return this.getBookingOrderUseCase.execute(parsedPaymentId, {
      authId: user.sub,
      canReadAll: hasPermission(user, ['reservations.read']),
      canReadHost: hasPermission(user, ['host.reservations.read']),
    });
  }

  @Get('host')
  @RequirePermissions('host.reservations.read')
  listForHost(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return this.listHostReservationsUseCase.execute(
      request.user!.sub,
      parseReservationQuery(query),
    );
  }

  @Get()
  @RequirePermissions('reservations.read')
  list(@Query() query: Record<string, unknown>) {
    return this.listReservationsUseCase.execute(parseReservationQuery(query));
  }

  @Get(':id')
  getById(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return this.getReservationUseCase.execute(parsedId, {
      authId: user.sub,
      canReadAll: hasPermission(user, ['reservations.read']),
      canReadHost: hasPermission(user, ['host.reservations.read']),
    });
  }

  @Post('cancel/:id')
  @RequirePermissions('reservations.cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    const user = request.user!;
    const parsedId = Number.parseInt(id, 10);

    return this.cancelReservationUseCase.execute(parsedId, {
      authId: user.sub,
      canCancelAll: hasPermission(user, ['reservations.cancel']),
      canCancelHost: hasPermission(user, ['host.reservations.read']),
    });
  }
}
