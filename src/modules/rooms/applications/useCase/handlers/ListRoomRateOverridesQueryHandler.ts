import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRateOverrideRepository } from '../../../domain/repositories/room-rate-override.repository';
import { RoomRateOverrideOutput } from '../../dto/room-rate-override.output';
import type { ListRoomRateOverridesQuery } from '../queries/ListRoomRateOverridesQuery';

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
