import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IPropertyTypeRepository } from '@src/modules/properties/domain/repositories/property-type.repository';
import type { DeletePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/DeletePropertyTypeCommand';

export class DeletePropertyTypeCommandHandler implements ICommandHandler<
  DeletePropertyTypeCommand,
  boolean
> {
  constructor(private readonly repository: IPropertyTypeRepository) {}

  async execute(command: DeletePropertyTypeCommand): Promise<boolean> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const usages = await this.repository.countUsages(command.id);
    if (usages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des établissements utilisent cette catégorie',
      );
    }

    return this.repository.delete(command.id);
  }
}
