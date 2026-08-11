import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreatePropertyCommand } from '@src/modules/properties/contracts';
import { fetchImageFromUrl } from '@src/modules/media/contracts';
import type { ImportPropertyRowDto } from '@src/modules/import/applications/dto/import-batch.dto';
import type { ImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import { emptyImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import {
  buildPropertyKey,
  type ImportBatchContext,
} from '@src/modules/import/applications/services/import-batch-context.service';
import { validateImportPropertyRow } from '@src/modules/import/applications/validation/validate-import-property-row';

export class ImportPropertiesHandler {
  async execute(
    rows: ImportPropertyRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const validation = validateImportPropertyRow(row);
      if (!validation.ok) {
        result.errors.push({
          entity: 'property',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const ownerId = context.emailToUserId.get(
        row.ownerEmail.trim().toLowerCase(),
      );
      if (!ownerId) {
        result.errors.push({
          entity: 'property',
          index,
          field: 'ownerEmail',
          message: `Propriétaire introuvable : ${row.ownerEmail}`,
        });
        continue;
      }

      const key = buildPropertyKey(ownerId, row.name.trim());
      if (context.propertyKeyToId.has(key)) {
        result.errors.push({
          entity: 'property',
          index,
          field: 'name',
          message: `L’établissement « ${row.name} » existe déjà pour ce propriétaire.`,
        });
        continue;
      }

      try {
        const imageFile = row.imageUrl
          ? await fetchImageFromUrl(row.imageUrl)
          : null;
        const created = await CommandBus.execute<{ id: number; name: string }>(
          new CreatePropertyCommand(
            {
              name: row.name.trim(),
              description: row.description.trim(),
              address: row.address.trim(),
              city: row.city.trim(),
              country: row.country.trim(),
              latitude: Number(row.latitude),
              longitude: Number(row.longitude),
              checkInTime: row.checkInTime.trim(),
              checkOutTime: row.checkOutTime.trim(),
              ownerId,
            },
            imageFile ?? undefined,
          ),
        );
        context.propertyKeyToId.set(key, created.id);
        context.propertyNameToId.set(created.name.trim(), created.id);
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'property',
          index,
          message:
            cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return result;
  }
}
