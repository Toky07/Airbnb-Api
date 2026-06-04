import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { slugify } from '../../../../shared/utils/slug.util';
import { PropertyType } from '../../domain/entities/property-type.entity';
import {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '../../domain/repositories/property-type.repository';
import type { CreatePropertyTypeDto } from '../dto/create-property-type.dto';
import { PropertyTypeOutput } from '../dto/property-type.output';

@Injectable()
export class CreatePropertyTypeUseCase {
  constructor(
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly repository: IPropertyTypeRepository,
  ) {}

  async execute(dto: CreatePropertyTypeDto): Promise<PropertyTypeOutput> {
    const name = dto.name?.trim();
    if (!name) {
      throw new ConflictException('Le nom est requis');
    }

    const slug = slugify(name);
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà');
    }

    const created = await this.repository.create(
      new PropertyType(
        name,
        slug,
        dto.sortOrder ?? 0,
        dto.isActive ?? true,
      ),
    );

    return PropertyTypeOutput.fromDomain(created);
  }
}
