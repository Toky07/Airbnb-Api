import {
  Body,
  Controller,
  Get,
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
import { parseReservationQuery } from './parse-reservation-query';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly listMyReservationsUseCase: ListMyReservationsUseCase,
    private readonly listHostReservationsUseCase: ListHostReservationsUseCase,
    private readonly getReservationUseCase: GetReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
  ) {}

  @Post()
  create(
    @Req() request: { user?: JwtPayload },
    @Body() dto: CreateReservationDto,
  ) {
    return this.createReservationUseCase.execute(request.user!.sub, dto);
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
  getById(@Req() request: { user?: JwtPayload }, @Param('id') id: number) {
    const user = request.user!;

    return this.getReservationUseCase.execute(Number(id), {
      authId: user.sub,
      canReadAll: hasPermission(user, ['reservations.read']),
      canReadHost: hasPermission(user, ['host.reservations.read']),
    });
  }

  @Post(':id/cancel')
  cancel(@Req() request: { user?: JwtPayload }, @Param('id') id: number) {
    const user = request.user!;

    return this.cancelReservationUseCase.execute(Number(id), {
      authId: user.sub,
      canCancelAll: hasPermission(user, ['reservations.cancel']),
      canCancelHost: hasPermission(user, ['host.reservations.read']),
    });
  }
}
