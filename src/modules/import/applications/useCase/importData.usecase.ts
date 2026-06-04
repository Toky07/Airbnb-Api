import { Inject, Injectable } from '@nestjs/common';
import { CreatePropertyUseCase } from '../../../properties/applications/useCase/createProperty.usecase';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { CreateRoomUseCase } from '../../../rooms/applications/useCase/createRoom.usecase';
import { CreatePropertyTypeUseCase } from '../../../properties/applications/useCase/create-property-type.usecase';
import { PROPERTY_TYPE_REPOSITORY } from '../../../properties/domain/repositories/property-type.repository';
import type { IPropertyTypeRepository } from '../../../properties/domain/repositories/property-type.repository';
import { CreateRoomTypeUseCase } from '../../../rooms/applications/useCase/create-room-type.usecase';
import { ROOM_TYPE_REPOSITORY } from '../../../rooms/domain/repositories/room-type.repository';
import type { IRoomTypeRepository } from '../../../rooms/domain/repositories/room-type.repository';
import { CreateUserUseCase } from '../../../user/application/useCase/createuser.usecase';
import { slugify } from '../../../../shared/utils/slug.util';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { fetchImageFromUrl } from '../../../media/utils/fetch-image-from-url';
import { CreateRoleUseCase } from '../../../authentication/useCase/create-role.usecase';
import { UpdateRoleUseCase } from '../../../authentication/useCase/update-role.usecase';
import { SetRolePermissionsUseCase } from '../../../authentication/useCase/set-role-permissions.usecase';
import { ROLE_REPOSITORY } from '../../../authentication/domain/repositories/role.repository';
import type { IRoleRepository } from '../../../authentication/domain/repositories/role.repository';
import {
  SUPERADMIN_ROLE_SLUG,
} from '../../../authentication/domain/constants/permissions.constant';
import type {
  ImportBatchDto,
  ImportBatchResult,
  ImportRowError,
} from '../dto/import-batch.dto';
import {
  parseImageUrlList,
  validateImportCategoryTypeRow,
  validateImportPropertyRow,
  validateImportRoleRow,
  validateImportRoomRow,
  validateImportUserRow,
  parseRolePermissionKeys,
} from '../validation/validate-import-rows';

@Injectable()
export class ImportDataUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly createProperty: CreatePropertyUseCase,
    private readonly createRoom: CreateRoomUseCase,
    private readonly createPropertyType: CreatePropertyTypeUseCase,
    private readonly createRoomType: CreateRoomTypeUseCase,
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly setRolePermissions: SetRolePermissionsUseCase,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly propertyTypeRepository: IPropertyTypeRepository,
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
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

    const propertyTypeSlugs = new Set<string>();
    const roomTypeSlugs = new Set<string>();

    for (const type of await this.propertyTypeRepository.findAll()) {
      propertyTypeSlugs.add(type.slug);
    }
    for (const type of await this.roomTypeRepository.findAll()) {
      roomTypeSlugs.add(type.slug);
    }

    let usersCreated = 0;
    let propertiesCreated = 0;
    let roomsCreated = 0;
    let propertyTypesCreated = 0;
    let roomTypesCreated = 0;
    let rolesCreated = 0;

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

    for (let index = 0; index < (batch.propertyTypes?.length ?? 0); index++) {
      const row = batch.propertyTypes![index]!;
      const validation = validateImportCategoryTypeRow(row);
      if (!validation.ok) {
        errors.push({
          entity: 'propertyType',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = slugify(row.name.trim());
      if (propertyTypeSlugs.has(slug)) {
        errors.push({
          entity: 'propertyType',
          index,
          field: 'name',
          message: `Le type « ${row.name} » existe déjà.`,
        });
        continue;
      }

      try {
        const created = await this.createPropertyType.execute({
          name: row.name.trim(),
          sortOrder: Number(row.sortOrder),
          isActive: row.isActive,
        });
        propertyTypeSlugs.add(created.slug);
        propertyTypesCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'propertyType',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    for (let index = 0; index < (batch.roomTypes?.length ?? 0); index++) {
      const row = batch.roomTypes![index]!;
      const validation = validateImportCategoryTypeRow(row);
      if (!validation.ok) {
        errors.push({
          entity: 'roomType',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = slugify(row.name.trim());
      if (roomTypeSlugs.has(slug)) {
        errors.push({
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
        roomTypeSlugs.add(created.slug);
        roomTypesCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'roomType',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    for (let index = 0; index < (batch.roles?.length ?? 0); index++) {
      const row = batch.roles![index]!;
      const validation = validateImportRoleRow(row);
      if (!validation.ok) {
        errors.push({
          entity: 'role',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = row.slug.trim();
      const permissionKeys = parseRolePermissionKeys(row.permissionKeys);
      const existing = await this.roleRepository.findBySlug(slug);

      try {
        if (slug === SUPERADMIN_ROLE_SLUG) {
          if (existing?.id) {
            if (row.description?.trim()) {
              await this.updateRole.execute({
                id: existing.id,
                description: row.description.trim(),
              });
            }
            rolesCreated += 1;
          } else {
            errors.push({
              entity: 'role',
              index,
              field: 'slug',
              message: 'Le rôle super administrateur doit exister avant import.',
            });
          }
          continue;
        }

        if (existing?.id) {
          await this.updateRole.execute({
            id: existing.id,
            name: row.name.trim(),
            description: row.description?.trim() || null,
          });
          await this.setRolePermissions.execute(existing.id, permissionKeys);
          rolesCreated += 1;
          continue;
        }

        const created = await this.createRole.execute({
          name: row.name.trim(),
          slug,
          description: row.description?.trim() || null,
        });
        await this.setRolePermissions.execute(created.id, permissionKeys);
        rolesCreated += 1;
      } catch (cause) {
        errors.push({
          entity: 'role',
          index,
          message: cause instanceof Error ? cause.message : 'Import impossible.',
        });
      }
    }

    return {
      created: {
        users: usersCreated,
        properties: propertiesCreated,
        rooms: roomsCreated,
        propertyTypes: propertyTypesCreated,
        roomTypes: roomTypesCreated,
        roles: rolesCreated,
      },
      errors,
    };
  }

  private propertyKey(ownerId: number, name: string): string {
    return `${ownerId}|${name}`;
  }
}
