import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  ImportBatchDto,
  ImportBatchResult,
} from '@src/modules/import/applications/dto/import-batch.dto';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { IMPORT_THROTTLE } from '@src/config/throttle.config';
import { SensitiveRouteThrottle } from '@src/shared/decorators/sensitive-route-throttle.decorator';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { ImportDataCommand } from '@src/modules/import/applications/useCase/commands/ImportDataCommand';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.IMPORT)
@ApiJwtAuth()
@Controller('import')
export class ImportController {
  @Post()
  @SensitiveRouteThrottle(IMPORT_THROTTLE)
  @RequirePermissions('import.execute')
  @ApiOperation({
    summary: 'Import CSV bulk (utilisateurs, établissements, etc.)',
  })
  async import(@Body() body: ImportBatchDto): Promise<ImportBatchResult> {
    return CommandBus.execute<ImportBatchResult>(new ImportDataCommand(body));
  }
}
