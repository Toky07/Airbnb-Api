import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/repositories/room.repository';
import { RoomOutput } from '../dto/room.output';
import { RoomMediaPresenter } from '../presenters/room-media.presenter';

@Injectable()
export class ListRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
    private readonly presenter: RoomMediaPresenter,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<RoomOutput>> {
    const result = await this.repository.findPaginated(params);

    const data = await Promise.all(
      result.data.map((room) => this.presenter.toOutput(room)),
    );

    return { data, meta: result.meta };
  }
}
