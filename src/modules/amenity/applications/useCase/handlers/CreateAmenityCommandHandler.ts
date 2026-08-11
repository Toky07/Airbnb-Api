import { ConflictException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { CreateAmenityCommand } from '@src/modules/amenity/applications/useCase/commands/CreateAmenityCommand';

export class CreateAmenityCommandHandler implements ICommandHandler<
  CreateAmenityCommand,
  AmenityOutput
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(command: CreateAmenityCommand): Promise<AmenityOutput> {
    const name = command.dto.name?.trim();
    const icon = command.dto.icon?.trim();
    const scope = command.dto.scope;

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
      new Amenity(name, icon, scope, command.dto.isActive ?? true),
    );

    return AmenityOutput.fromDomain(created);
  }

  private isValidScope(scope: AmenityScope): boolean {
    return scope === AMENITY_SCOPE.PROPERTY || scope === AMENITY_SCOPE.ROOM;
  }
}
