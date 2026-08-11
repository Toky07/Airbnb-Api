/**
 * Surface publique du module rooms.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf RoomsModule Nest et ORM RoomEntity).
 * Pour éviter les cycles properties↔rooms, préférer le leaf
 * `contracts/room-summary` depuis le module properties.
 */
export {
  toRoomDomain,
  toRoomSummary,
  type RoomSummary,
  type RoomSummarySource,
} from './room-summary';
export {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../domain/repositories/room.repository';
export {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '../domain/repositories/room-type.repository';
export {
  ROOM_BLOCKED_DATE_REPOSITORY,
  type IRoomBlockedDateRepository,
} from '../domain/repositories/room-blocked-date.repository';
export {
  ROOM_RATE_OVERRIDE_REPOSITORY,
  type IRoomRateOverrideRepository,
} from '../domain/repositories/room-rate-override.repository';
export { Room } from '../domain/entities/room.entity';
export { RoomOutput } from '../applications/dto/room.output';
export { RoomTypeOutput } from '../applications/dto/room-type.output';
export type { CreateRoomDto } from '../applications/dto/createRoom.dto';
export type { CreateRoomBlockedDateDto } from '../applications/dto/create-room-blocked-date.dto';
export type { CreateRoomRateOverrideDto } from '../applications/dto/create-room-rate-override.dto';
export { RoomBlockedDateOutput } from '../applications/dto/room-blocked-date.output';
export { RoomRateOverrideOutput } from '../applications/dto/room-rate-override.output';
export { parseRoomBody } from '../interfaces/http/parse-room-body';
export { parseKeptImages } from '../interfaces/http/parse-kept-images';
export { RoomMediaPresenter } from '../applications/presenters/room-media.presenter';
export { RoomStayPricingService } from '../applications/services/room-stay-pricing.service';
export {
  RoomProductSummaryService,
  type RoomProductSummary,
} from '../applications/services/room-product-summary.service';
export { CreateRoomCommand } from '../applications/useCase/commands/CreateRoomCommand';
export { UpdateRoomCommand } from '../applications/useCase/commands/UpdateRoomCommand';
export { DeleteRoomCommand } from '../applications/useCase/commands/DeleteRoomCommand';
export { CreateRoomTypeCommand } from '../applications/useCase/commands/CreateRoomTypeCommand';
export { UpdateRoomTypeCommand } from '../applications/useCase/commands/UpdateRoomTypeCommand';
export { DeleteRoomTypeCommand } from '../applications/useCase/commands/DeleteRoomTypeCommand';
export { CreateRoomBlockedDateCommand } from '../applications/useCase/commands/CreateRoomBlockedDateCommand';
export { DeleteRoomBlockedDateCommand } from '../applications/useCase/commands/DeleteRoomBlockedDateCommand';
export { CreateRoomRateOverrideCommand } from '../applications/useCase/commands/CreateRoomRateOverrideCommand';
export { DeleteRoomRateOverrideCommand } from '../applications/useCase/commands/DeleteRoomRateOverrideCommand';
export { FindRoomQuery } from '../applications/useCase/queries/FindRoomQuery';
export { ListRoomsQuery } from '../applications/useCase/queries/ListRoomsQuery';
export { ListRoomTypesQuery } from '../applications/useCase/queries/ListRoomTypesQuery';
export { ListRoomTypeOptionsQuery } from '../applications/useCase/queries/ListRoomTypeOptionsQuery';
export { ListRoomBlockedDatesQuery } from '../applications/useCase/queries/ListRoomBlockedDatesQuery';
export { ListRoomRateOverridesQuery } from '../applications/useCase/queries/ListRoomRateOverridesQuery';
export { GetRoomPricingPreviewQuery } from '../applications/useCase/queries/GetRoomPricingPreviewQuery';
