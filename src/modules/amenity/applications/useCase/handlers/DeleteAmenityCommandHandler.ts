import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';
import type { DeleteAmenityCommand } from '../commands/DeleteAmenityCommand';

export class DeleteAmenityCommandHandler
  implements ICommandHandler<DeleteAmenityCommand, boolean>
{
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(command: DeleteAmenityCommand): Promise<boolean> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Équipement introuvable');
    }

    const propertyUsages = await this.repository.countPropertyUsages(command.id);
    const roomUsages = await this.repository.countRoomUsages(command.id);

    if (propertyUsages > 0 || roomUsages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des établissements ou chambres utilisent cet équipement',
      );
    }

    return this.repository.delete(command.id);
  }
}
