import { Injectable } from '@nestjs/common';
import { CreateRoomTypeUseCase } from '../../../rooms/applications/useCase/create-room-type.usecase';
import { slugify } from '../../../../shared/utils/slug.util';
import type { ImportCategoryTypeRowDto } from '../dto/import-batch.dto';
import type { ImportEntityResult } from '../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../dto/import-entity-result.dto';
import type { ImportBatchContext } from '../services/import-batch-context.service';
import { validateImportCategoryTypeRow } from '../validation/validate-import-category-type-row';

@Injectable()
export class ImportRoomTypesUseCase {
  constructor(private readonly createRoomType: CreateRoomTypeUseCase) {}

  async execute(
    rows: ImportCategoryTypeRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]!;
      const validation = validateImportCategoryTypeRow(row);
      if (!validation.ok) {
        result.errors.push({
          entity: 'roomType',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = slugify(row.name.trim());
      if (context.roomTypeSlugs.has(slug)) {
        result.errors.push({
          entity: 'roomType',
          index,
          field: 'name',
          message: `Le type « ${row.name} » existe déjà.`,
        });
        continue;
      }

      try {
        const created = await this.createRoomType.execute({
          name: row.name.trim(),
          sortOrder: Number(row.sortOrder),
          isActive: row.isActive,
        });
        context.roomTypeSlugs.add(created.slug);
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'roomType',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return result;
  }
}
