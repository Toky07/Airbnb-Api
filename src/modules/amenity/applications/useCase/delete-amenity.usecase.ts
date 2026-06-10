import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';

@Injectable()
export class DeleteAmenityUseCase {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly repository: IAmenityRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Équipement introuvable');
    }

    const propertyUsages = await this.repository.countPropertyUsages(id);
    const roomUsages = await this.repository.countRoomUsages(id);

    if (propertyUsages > 0 || roomUsages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des établissements ou chambres utilisent cet équipement',
      );
    }

    return this.repository.delete(id);
  }
}
