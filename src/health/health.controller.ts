import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@src/modules/authentication/contracts';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.HEALTH)
@Controller('health')
export class HealthController {
  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Vérification de disponibilité de l'API" })
  check() {
    return { status: 'ok' };
  }
}
