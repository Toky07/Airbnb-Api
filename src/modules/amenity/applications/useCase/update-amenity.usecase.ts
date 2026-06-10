import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Amenity } from '../../domain/entities/amenity.entity';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import type { UpdateAmenityDto } from '../dto/create-amenity.dto';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class UpdateAmenityUseCase {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly repository: IAmenityRepository,
  ) {}

  async execute(id: number, dto: UpdateAmenityDto): Promise<AmenityOutput> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Équipement introuvable');
    }

    const name = dto.name?.trim() ?? current.name;
    const icon = dto.icon?.trim() ?? current.icon;

    if (!name) {
      throw new ConflictException('Le nom est requis');
    }

    if (!icon) {
      throw new ConflictException("L'icône est requise");
    }

    const duplicate = await this.repository.findByName(name, current.scope);
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Un équipement avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new Amenity(
        name,
        icon,
        current.scope,
        dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return AmenityOutput.fromDomain(updated);
  }
}
