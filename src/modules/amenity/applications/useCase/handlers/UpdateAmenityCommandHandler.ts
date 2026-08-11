import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { UpdateAmenityCommand } from '@src/modules/amenity/applications/useCase/commands/UpdateAmenityCommand';

export class UpdateAmenityCommandHandler implements ICommandHandler<
  UpdateAmenityCommand,
  AmenityOutput
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(command: UpdateAmenityCommand): Promise<AmenityOutput> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Équipement introuvable');
    }

    const name = command.dto.name?.trim() ?? current.name;
    const icon = command.dto.icon?.trim() ?? current.icon;

    if (!name) {
      throw new ConflictException('Le nom est requis');
    }

    if (!icon) {
      throw new ConflictException("L'icône est requise");
    }

    const duplicate = await this.repository.findByName(name, current.scope);
    if (duplicate && duplicate.id !== command.id) {
      throw new ConflictException('Un équipement avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new Amenity(
        name,
        icon,
        current.scope,
        command.dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return AmenityOutput.fromDomain(updated);
  }
}
