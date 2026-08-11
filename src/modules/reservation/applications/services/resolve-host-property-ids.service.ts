import { Inject, Injectable } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { USER_REPOSITORY } from '../../../user/contracts';
import type { IUserRepository } from '../../../user/contracts';

@Injectable()
export class ResolveHostPropertyIdsService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async resolve(authId: number, filterPropertyId?: number): Promise<number[]> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      return [];
    }

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
    const propertyIds = properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    if (filterPropertyId != null && filterPropertyId > 0) {
      return propertyIds.includes(filterPropertyId) ? [filterPropertyId] : [];
    }

    return propertyIds;
  }
}
