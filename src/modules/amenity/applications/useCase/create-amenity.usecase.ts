import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Amenity } from '../../domain/entities/amenity.entity';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '../../domain/constants/amenity-scope.constant';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import type { CreateAmenityDto } from '../dto/create-amenity.dto';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class CreateAmenityUseCase {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly repository: IAmenityRepository,
  ) {}

  async execute(dto: CreateAmenityDto): Promise<AmenityOutput> {
    const name = dto.name?.trim();
    const icon = dto.icon?.trim();
    const scope = dto.scope;

    if (!name) {
      throw new ConflictException('Le nom est requis');
    }

    if (!icon) {
      throw new ConflictException("L'icône est requise");
    }

    if (!this.isValidScope(scope)) {
      throw new ConflictException('Le scope est invalide');
    }

    const existing = await this.repository.findByName(name, scope);
    if (existing) {
      throw new ConflictException('Un équipement avec ce nom existe déjà');
    }

    const created = await this.repository.create(
      new Amenity(name, icon, scope, dto.isActive ?? true),
    );

    return AmenityOutput.fromDomain(created);
  }

  private isValidScope(scope: AmenityScope): boolean {
    return scope === AMENITY_SCOPE.PROPERTY || scope === AMENITY_SCOPE.ROOM;
  }
}
