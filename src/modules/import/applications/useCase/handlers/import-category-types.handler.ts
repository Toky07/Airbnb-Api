import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreatePropertyTypeCommand } from '../../../../properties/contracts';
import { CreateRoomTypeCommand } from '../../../../rooms/contracts';
import { RoomTypeOutput } from '../../../../rooms/contracts';
import { slugify } from '../../../../../shared/utils/slug.util';
import type { ImportCategoryTypeRowDto } from '../../dto/import-batch.dto';
import type { ImportEntityResult } from '../../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../../dto/import-entity-result.dto';
import type { ImportBatchContext } from '../../services/import-batch-context.service';
import { validateImportCategoryTypeRow } from '../../validation/validate-import-category-type-row';
import {
  pushImportRowError,
  pushImportValidationError,
  toImportErrorMessage,
} from '../../utils/import-error.util';
import type { ImportRowError } from '../../dto/import-batch.dto';

type CategoryTypeImportTarget = Extract<
  ImportRowError['entity'],
  'propertyType' | 'roomType'
>;

type CategoryTypeImportConfig = {
  entity: CategoryTypeImportTarget;
  getSlugSet: (context: ImportBatchContext) => Set<string>;
  create: (row: ImportCategoryTypeRowDto) => Promise<{ slug: string }>;
};

const PROPERTY_TYPE_CONFIG: CategoryTypeImportConfig = {
  entity: 'propertyType',
  getSlugSet: (context) => context.propertyTypeSlugs,
  create: (row) =>
    CommandBus.execute<{ slug: string }>(
      new CreatePropertyTypeCommand({
        name: row.name.trim(),
        sortOrder: Number(row.sortOrder),
        isActive: row.isActive,
      }),
    ),
};

const ROOM_TYPE_CONFIG: CategoryTypeImportConfig = {
  entity: 'roomType',
  getSlugSet: (context) => context.roomTypeSlugs,
  create: (row) =>
    CommandBus.execute<RoomTypeOutput>(
      new CreateRoomTypeCommand({
        name: row.name.trim(),
        sortOrder: Number(row.sortOrder),
        isActive: row.isActive,
      }),
    ),
};

export async function importCategoryTypes(
  rows: ImportCategoryTypeRowDto[] | undefined,
  context: ImportBatchContext,
  config: CategoryTypeImportConfig,
): Promise<ImportEntityResult> {
  if (!rows?.length) {
    return emptyImportEntityResult();
  }

  const result = emptyImportEntityResult();
  const slugSet = config.getSlugSet(context);

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const validation = validateImportCategoryTypeRow(row);
    if (!validation.ok) {
      pushImportValidationError(result, config.entity, index, validation);
      continue;
    }

    const slug = slugify(row.name.trim());
    if (slugSet.has(slug)) {
      pushImportRowError(
        result,
        config.entity,
        index,
        `Le type « ${row.name} » existe déjà.`,
        'name',
      );
      continue;
    }

    try {
      const created = await config.create(row);
      slugSet.add(created.slug);
      result.created += 1;
    } catch (cause) {
      pushImportRowError(
        result,
        config.entity,
        index,
        toImportErrorMessage(cause),
      );
    }
  }

  return result;
}

export class ImportPropertyTypesHandler {
  execute(
    rows: ImportCategoryTypeRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    return importCategoryTypes(rows, context, PROPERTY_TYPE_CONFIG);
  }
}

export class ImportRoomTypesHandler {
  execute(
    rows: ImportCategoryTypeRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    return importCategoryTypes(rows, context, ROOM_TYPE_CONFIG);
  }
}
