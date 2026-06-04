import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '../../domain/repositories/property-type.repository';

@Injectable()
export class DeletePropertyTypeUseCase {
  constructor(
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly repository: IPropertyTypeRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const usages = await this.repository.countUsages(id);
    if (usages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des établissements utilisent cette catégorie',
      );
    }

    return this.repository.delete(id);
  }
}
