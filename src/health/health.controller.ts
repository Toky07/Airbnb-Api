import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/authentication/interfaces/decorators/public.decorator';
import { SWAGGER_TAGS } from '../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.HEALTH)
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Vérification de disponibilité de l'API" })
  check() {
    return { status: 'ok' };
  }
}
