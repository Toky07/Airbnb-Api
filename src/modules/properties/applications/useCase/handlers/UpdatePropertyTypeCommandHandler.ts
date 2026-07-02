import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { slugify } from '../../../../../shared/utils/slug.util';
import { PropertyType } from '../../../domain/entities/property-type.entity';
import type { IPropertyTypeRepository } from '../../../domain/repositories/property-type.repository';
import { PropertyTypeOutput } from '../../dto/property-type.output';
import type { UpdatePropertyTypeCommand } from '../commands/UpdatePropertyTypeCommand';

export class UpdatePropertyTypeCommandHandler
  implements ICommandHandler<UpdatePropertyTypeCommand, PropertyTypeOutput>
{
  constructor(private readonly repository: IPropertyTypeRepository) {}

  async execute(command: UpdatePropertyTypeCommand): Promise<PropertyTypeOutput> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const name = command.dto.name?.trim() ?? current.name;
    const slug = slugify(name);
    const duplicate = await this.repository.findBySlug(slug);
    if (duplicate && duplicate.id !== command.id) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new PropertyType(
        name,
        slug,
        command.dto.sortOrder ?? current.sortOrder,
        command.dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return PropertyTypeOutput.fromDomain(updated);
  }
}
