import type { ImportBatchDto } from '../../dto/import-batch.dto';

export class ImportDataCommand {
  constructor(public readonly batch: ImportBatchDto) {}
}
