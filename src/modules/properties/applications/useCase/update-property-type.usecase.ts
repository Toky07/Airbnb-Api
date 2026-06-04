import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from '../../../../shared/utils/slug.util';
import { PropertyType } from '../../domain/entities/property-type.entity';
import {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '../../domain/repositories/property-type.repository';
import type { UpdatePropertyTypeDto } from '../dto/create-property-type.dto';
import { PropertyTypeOutput } from '../dto/property-type.output';

@Injectable()
export class UpdatePropertyTypeUseCase {
  constructor(
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly repository: IPropertyTypeRepository,
  ) {}

  async execute(id: number, dto: UpdatePropertyTypeDto): Promise<PropertyTypeOutput> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const name = dto.name?.trim() ?? current.name;
    const slug = slugify(name);
    const duplicate = await this.repository.findBySlug(slug);
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new PropertyType(
        name,
        slug,
        dto.sortOrder ?? current.sortOrder,
        dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return PropertyTypeOutput.fromDomain(updated);
  }
}
