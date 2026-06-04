import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '../../domain/repositories/room-type.repository';

@Injectable()
export class DeleteRoomTypeUseCase {
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly repository: IRoomTypeRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Type de chambre introuvable');
    }

    const usages = await this.repository.countUsages(id);
    if (usages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des chambres utilisent ce type',
      );
    }

    return this.repository.delete(id);
  }
}
