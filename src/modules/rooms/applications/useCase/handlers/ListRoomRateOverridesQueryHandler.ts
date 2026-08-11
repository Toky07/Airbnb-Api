import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRateOverrideRepository } from '@src/modules/rooms/domain/repositories/room-rate-override.repository';
import { RoomRateOverrideOutput } from '@src/modules/rooms/applications/dto/room-rate-override.output';
import type { ListRoomRateOverridesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomRateOverridesQuery';

export class ListRoomRateOverridesQueryHandler implements IQueryHandler<
  ListRoomRateOverridesQuery,
  RoomRateOverrideOutput[]
> {
  constructor(
    private readonly rateOverrideRepository: IRoomRateOverrideRepository,
  ) {}

  async execute(
    query: ListRoomRateOverridesQuery,
  ): Promise<RoomRateOverrideOutput[]> {
    const overrides = await this.rateOverrideRepository.findByRoomId(
      query.roomId,
    );
    return overrides.map((override) =>
      RoomRateOverrideOutput.fromDomain(override),
    );
  }
}
