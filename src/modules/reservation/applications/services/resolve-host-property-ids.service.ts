import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';

export class ResolveHostPropertyIdsService {
  constructor(
    private readonly userRepository: IUserRepository,
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
