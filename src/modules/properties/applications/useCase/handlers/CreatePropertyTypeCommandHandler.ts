import { ConflictException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { slugify } from '../../../../../shared/utils/slug.util';
import { PropertyType } from '../../../domain/entities/property-type.entity';
import type { IPropertyTypeRepository } from '../../../domain/repositories/property-type.repository';
import { PropertyTypeOutput } from '../../dto/property-type.output';
import type { CreatePropertyTypeCommand } from '../commands/CreatePropertyTypeCommand';

export class CreatePropertyTypeCommandHandler
  implements ICommandHandler<CreatePropertyTypeCommand, PropertyTypeOutput>
{
  constructor(private readonly repository: IPropertyTypeRepository) {}

  async execute(command: CreatePropertyTypeCommand): Promise<PropertyTypeOutput> {
    const name = command.dto.name?.trim();
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
        command.dto.sortOrder ?? 0,
        command.dto.isActive ?? true,
      ),
    );

    return PropertyTypeOutput.fromDomain(created);
  }
}
