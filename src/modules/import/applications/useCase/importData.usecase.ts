import { Inject, Injectable } from '@nestjs/common';
import { CreatePropertyUseCase } from '../../../properties/applications/useCase/createProperty.usecase';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { CreateRoomUseCase } from '../../../rooms/applications/useCase/createRoom.usecase';
import { CreateUserUseCase } from '../../../user/application/useCase/createuser.usecase';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { fetchImageFromUrl } from '../../../media/utils/fetch-image-from-url';
import type {
  ImportBatchDto,
  ImportBatchResult,
  ImportRowError,
} from '../dto/import-batch.dto';
import {
  parseImageUrlList,
  validateImportPropertyRow,
  validateImportRoomRow,
  validateImportUserRow,
} from '../validation/validate-import-rows';

@Injectable()
export class ImportDataUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly createProperty: CreatePropertyUseCase,
    private readonly createRoom: CreateRoomUseCase,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(batch: ImportBatchDto): Promise<ImportBatchResult> {
    const errors: ImportRowError[] = [];
    const emailToUserId = new Map<string, number>();
    const propertyKeyToId = new Map<string, number>();
    const propertyNameToId = new Map<string, number>();

    for (const user of await this.userRepository.findAll()) {
      emailToUserId.set(user.email.toLowerCase(), user.id!);
    }

    for (const property of await this.propertyRepository.findAll()) {
      propertyKeyToId.set(
        this.propertyKey(property.ownerId, property.name),
        property.id!,
      );
      propertyNameToId.set(property.name.trim(), property.id!);
    }

    let usersCreated = 0;
    let propertiesCreated = 0;
    let roomsCreated = 0;

    for (let index = 0; index < (batch.users?.length ?? 0); index++) {
      const row = batch.users![index]!;
      const validation = validateImportUserRow(row, index);
      if (!validation.ok) {
        errors.push({
          entity: 'user',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const emailKey = row.email.trim().toLowerCase();
      if (emailToUserId.has(emailKey)) {
        errors.push({
          entity: 'user',
          index,
          field: 'email',
          message: `L’e-mail ${row.email} existe déjà.`,
        });
        continue;
      }

      try {
        const avatarFile = row.avatarUrl
          ? await fetchImageFromUrl(row.avatarUrl)
          : null;
        const created = await this.createUser.execute(
          {
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            email: row.email.trim(),
            phoneNumber: row.phoneNumber.trim(),
            avatar: row.avatarUrl?.trim() ?? '',
          },
          avatarFile ?? undefined,
        );
        emailToUserId.set(emailKey, created.id);
        usersCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'user',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    for (let index = 0; index < (batch.properties?.length ?? 0); index++) {
      const row = batch.properties![index]!;
      const validation = validateImportPropertyRow(row);
      if (!validation.ok) {
        errors.push({
          entity: 'property',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const ownerId = emailToUserId.get(row.ownerEmail.trim().toLowerCase());
      if (!ownerId) {
        errors.push({
          entity: 'property',
          index,
          field: 'ownerEmail',
          message: `Propriétaire introuvable : ${row.ownerEmail}`,
        });
        continue;
      }

      const key = this.propertyKey(ownerId, row.name.trim());
      if (propertyKeyToId.has(key)) {
        errors.push({
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
        const created = await this.createProperty.execute(
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
        );
        propertyKeyToId.set(key, created.id);
        propertyNameToId.set(created.name.trim(), created.id);
        propertiesCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'property',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    for (let index = 0; index < (batch.rooms?.length ?? 0); index++) {
      const row = batch.rooms![index]!;
      const validation = validateImportRoomRow(row);
      if (!validation.ok) {
        errors.push({
          entity: 'room',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const propertyId = propertyNameToId.get(row.propertyName.trim());
      if (!propertyId) {
        errors.push({
          entity: 'room',
          index,
          field: 'propertyName',
          message: `Établissement introuvable : ${row.propertyName}`,
        });
        continue;
      }
      const property = await this.propertyRepository.findById(propertyId);
      if (!property) {
        errors.push({
          entity: 'room',
          index,
          field: 'propertyName',
          message: `Établissement introuvable : ${row.propertyName}`,
        });
        continue;
      }

      try {
        const imageUrls = parseImageUrlList(row.imageUrls);
        const imageFiles = (
          await Promise.all(imageUrls.map((url) => fetchImageFromUrl(url)))
        ).filter((file): file is NonNullable<typeof file> => file !== null);

        await this.createRoom.execute(
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
        );
        roomsCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'room',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return {
      created: {
        users: usersCreated,
        properties: propertiesCreated,
        rooms: roomsCreated,
      },
      errors,
    };
  }

  private propertyKey(ownerId: number, name: string): string {
    return `${ownerId}|${name}`;
  }
}
