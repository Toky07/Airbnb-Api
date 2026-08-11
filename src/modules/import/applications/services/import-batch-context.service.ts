import { Inject, Injectable } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from '../../../properties/domain/repositories/property-type.repository';
import type { IPropertyTypeRepository } from '../../../properties/domain/repositories/property-type.repository';
import { ROOM_TYPE_REPOSITORY } from '../../../rooms/domain/repositories/room-type.repository';
import type { IRoomTypeRepository } from '../../../rooms/domain/repositories/room-type.repository';
import { USER_REPOSITORY } from '../../../user/contracts';
import type { IUserRepository } from '../../../user/contracts';

export type ImportBatchContext = {
  emailToUserId: Map<string, number>;
  propertyKeyToId: Map<string, number>;
  propertyNameToId: Map<string, number>;
  propertyTypeSlugs: Set<string>;
  roomTypeSlugs: Set<string>;
};

export function buildPropertyKey(ownerId: number, name: string): string {
  return `${ownerId}|${name}`;
}

@Injectable()
export class ImportBatchContextService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly propertyTypeRepository: IPropertyTypeRepository,
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
  ) {}

  async create(): Promise<ImportBatchContext> {
    const emailToUserId = new Map<string, number>();
    const propertyKeyToId = new Map<string, number>();
    const propertyNameToId = new Map<string, number>();
    const propertyTypeSlugs = new Set<string>();
    const roomTypeSlugs = new Set<string>();

    for (const user of await this.userRepository.findAll()) {
      emailToUserId.set(user.email.toLowerCase(), user.id!);
    }

    for (const property of await this.propertyRepository.findAll()) {
      propertyKeyToId.set(
        buildPropertyKey(property.ownerId, property.name),
        property.id!,
      );
      propertyNameToId.set(property.name.trim(), property.id!);
    }

    for (const type of await this.propertyTypeRepository.findAll()) {
      propertyTypeSlugs.add(type.slug);
    }

    for (const type of await this.roomTypeRepository.findAll()) {
      roomTypeSlugs.add(type.slug);
    }

    return {
      emailToUserId,
      propertyKeyToId,
      propertyNameToId,
      propertyTypeSlugs,
      roomTypeSlugs,
    };
  }
}
