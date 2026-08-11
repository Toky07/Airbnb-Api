import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { Property } from '@src/modules/properties/contracts';
import { PROPERTY_REPOSITORY } from '@src/modules/properties/contracts';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import { ResolveHostUserService } from './resolve-host-user.service';

@Injectable()
export class ResolveHostPropertyService {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async listOwned(authUser: JwtPayload): Promise<Property[]> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    return this.propertyRepository.findAllByOwnerId(user.id!);
  }

  async listOwnedIds(authUser: JwtPayload): Promise<number[]> {
    const properties = await this.listOwned(authUser);
    return properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);
  }

  async requireOwned(
    authUser: JwtPayload,
    propertyId: number,
  ): Promise<Property> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByIdForOwner(
      propertyId,
      user.id!,
    );

    if (!property) {
      throw new ForbiddenException(
        'Établissement introuvable ou accès refusé.',
      );
    }

    return property;
  }

  async requireAnyOwned(authUser: JwtPayload): Promise<Property> {
    const properties = await this.listOwned(authUser);
    const property = properties[0];

    if (!property?.id) {
      throw new NotFoundException("Créez d'abord un établissement.");
    }

    return property;
  }
}
