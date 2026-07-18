import { Body, Controller, Post } from '@nestjs/common';
import type { ImportBatchDto } from '../../applications/dto/import-batch.dto';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { IMPORT_THROTTLE } from '../../../../config/throttle.config';
import { SensitiveRouteThrottle } from '../../../../shared/decorators/sensitive-route-throttle.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { ImportDataCommand } from '../../applications/useCase/commands/ImportDataCommand';

@Controller('import')
export class ImportController {
  @Post()
  @SensitiveRouteThrottle(IMPORT_THROTTLE)
  @RequirePermissions('import.execute')
  async import(@Body() body: ImportBatchDto) {
    return CommandBus.execute(new ImportDataCommand(body));
  }
}
