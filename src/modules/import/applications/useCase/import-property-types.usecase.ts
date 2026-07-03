import { Injectable } from '@nestjs/common';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { CreatePropertyTypeCommand } from '../../../properties/applications/useCase/commands/CreatePropertyTypeCommand';
import { slugify } from '../../../../shared/utils/slug.util';
import type { ImportCategoryTypeRowDto } from '../dto/import-batch.dto';
import type { ImportEntityResult } from '../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../dto/import-entity-result.dto';
import type { ImportBatchContext } from '../services/import-batch-context.service';
import { validateImportCategoryTypeRow } from '../validation/validate-import-category-type-row';

@Injectable()
export class ImportPropertyTypesUseCase {
  async execute(
    rows: ImportCategoryTypeRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const validation = validateImportCategoryTypeRow(row);
      if (!validation.ok) {
        result.errors.push({
          entity: 'propertyType',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = slugify(row.name.trim());
      if (context.propertyTypeSlugs.has(slug)) {
        result.errors.push({
          entity: 'propertyType',
          index,
          field: 'name',
          message: `Le type « ${row.name} » existe déjà.`,
        });
        continue;
      }

      try {
        const created = await CommandBus.execute<{ slug: string }>(
          new CreatePropertyTypeCommand({
            name: row.name.trim(),
            sortOrder: Number(row.sortOrder),
            isActive: row.isActive,
          }),
        );
        context.propertyTypeSlugs.add(created.slug);
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'propertyType',
          index,
          message:
            cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return result;
  }
}
