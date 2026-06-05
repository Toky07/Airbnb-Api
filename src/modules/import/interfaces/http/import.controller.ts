import { Body, Controller, Post } from '@nestjs/common';
import type { ImportBatchDto } from '../../applications/dto/import-batch.dto';
import { ImportDataUseCase } from '../../applications/useCase/import-data.usecase';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';

@Controller('import')
export class ImportController {
  constructor(private readonly importDataUseCase: ImportDataUseCase) {}

  @Post()
  @RequirePermissions('import.execute')
  async import(@Body() body: ImportBatchDto) {
    return this.importDataUseCase.execute(body);
  }
}
