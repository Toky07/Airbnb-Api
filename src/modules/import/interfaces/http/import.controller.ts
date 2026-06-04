import { Body, Controller, Post } from '@nestjs/common';
import type { ImportBatchDto } from '../../applications/dto/import-batch.dto';
import { ImportDataUseCase } from '../../applications/useCase/importData.usecase';

@Controller('import')
export class ImportController {
  constructor(private readonly importDataUseCase: ImportDataUseCase) {}

  @Post()
  async import(@Body() body: ImportBatchDto) {
    return this.importDataUseCase.execute(body);
  }
}
