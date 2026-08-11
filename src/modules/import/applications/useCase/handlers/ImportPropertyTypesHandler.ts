import type { ImportCategoryTypeRowDto } from '@src/modules/import/applications/dto/import-batch.dto';
import type { ImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import type { ImportBatchContext } from '@src/modules/import/applications/services/import-batch-context.service';
import {
  importCategoryTypes,
  PROPERTY_TYPE_CONFIG,
} from './import-category-types';

export class ImportPropertyTypesHandler {
  execute(
    rows: ImportCategoryTypeRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    return importCategoryTypes(rows, context, PROPERTY_TYPE_CONFIG);
  }
}
