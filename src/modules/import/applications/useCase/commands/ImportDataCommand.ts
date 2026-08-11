import type { ImportBatchDto } from '@src/modules/import/applications/dto/import-batch.dto';

export class ImportDataCommand {
  constructor(public readonly batch: ImportBatchDto) {}
}
