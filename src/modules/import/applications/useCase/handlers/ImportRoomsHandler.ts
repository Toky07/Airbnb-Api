import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreateRoomCommand } from '../../../../rooms/contracts';
import type { IPropertyRepository } from '../../../../properties/contracts';
import { fetchImageFromUrl } from '../../../../media/contracts';
import type { ImportRoomRowDto } from '../../dto/import-batch.dto';
import type { ImportEntityResult } from '../../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../../dto/import-entity-result.dto';
import type { ImportBatchContext } from '../../services/import-batch-context.service';
import { parseImportRoomImageUrls } from '../../validation/parse-import-room-image-urls';
import { validateImportRoomRow } from '../../validation/validate-import-room-row';

export class ImportRoomsHandler {
  constructor(private readonly propertyRepository: IPropertyRepository) {}

  async execute(
    rows: ImportRoomRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const validation = validateImportRoomRow(row);
      if (!validation.ok) {
        result.errors.push({
          entity: 'room',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const propertyId = context.propertyNameToId.get(row.propertyName.trim());
      if (!propertyId) {
        result.errors.push({
          entity: 'room',
          index,
          field: 'propertyName',
          message: `Établissement introuvable : ${row.propertyName}`,
        });
        continue;
      }

      const property = await this.propertyRepository.findById(propertyId);
      if (!property) {
        result.errors.push({
          entity: 'room',
          index,
          field: 'propertyName',
          message: `Établissement introuvable : ${row.propertyName}`,
        });
        continue;
      }

      try {
        const imageUrls = parseImportRoomImageUrls(row.imageUrls);
        const imageFiles = (
          await Promise.all(imageUrls.map((url) => fetchImageFromUrl(url)))
        ).filter((file): file is NonNullable<typeof file> => file !== null);

        await CommandBus.execute(
          new CreateRoomCommand(
            {
              name: row.name.trim(),
              description: row.description.trim(),
              pricePerNight: Number(row.pricePerNight),
              maxGuests: Number(row.maxGuests),
              bedrooms: Number(row.bedrooms),
              bathrooms: Number(row.bathrooms),
              beds: Number(row.beds),
              quantity: Number(row.quantity),
              size: Number(row.size),
              status: row.status.trim(),
              property,
            },
            imageFiles.length > 0 ? imageFiles : undefined,
          ),
        );
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'room',
          index,
          message:
            cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return result;
  }
}
