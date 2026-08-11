import { Controller, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { CancelReservationCommand } from '@src/modules/reservation/contracts';
import { MarkReservationNoShowCommand } from '@src/modules/reservation/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.HOST)
@ApiJwtAuth()
@Controller('host')
export class HostReservationsController {
  @Post('reservations/:id/cancel')
  @RequirePermissions('host.reservations.read')
  cancelReservation(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return CommandBus.execute(
      new CancelReservationCommand(Number(id), {
        authId: request.user.sub,
        canCancelAll: false,
        canCancelHost: true,
      }),
    );
  }

  @Post('reservations/:id/no-show')
  @RequirePermissions('host.reservations.read')
  markReservationNoShow(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return CommandBus.execute(
      new MarkReservationNoShowCommand(Number(id), request.user.sub),
    );
  }
}
