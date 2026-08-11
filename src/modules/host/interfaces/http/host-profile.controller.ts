import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';
import { GetHostProfileQuery } from '@src/modules/host/applications/useCase/queries/GetHostProfileQuery';

@ApiTags(SWAGGER_TAGS.HOST)
@ApiJwtAuth()
@Controller('host')
export class HostProfileController {
  @Get('profile')
  @RequirePermissions('host.dashboard.read')
  @ApiOperation({ summary: 'Profil tableau de bord hôte' })
  profile(@Req() request: { user: JwtPayload }) {
    return QueryBus.execute(new GetHostProfileQuery(request.user));
  }
}
