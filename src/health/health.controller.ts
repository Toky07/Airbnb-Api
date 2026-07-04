import { Controller, Get } from '@nestjs/common';
import { Public } from '../modules/authentication/interfaces/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
