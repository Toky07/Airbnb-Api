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
  assertPubliclyListedRoom,
  isPubliclyListedRoom,
  PUBLIC_ROOM_STATUS,
} from '@src/modules/rooms/domain/utils/is-publicly-listed-room';
export {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '@src/modules/rooms/domain/repositories/room.repository';
export {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '@src/modules/rooms/domain/repositories/room-type.repository';
export {
  ROOM_BLOCKED_DATE_REPOSITORY,
  type IRoomBlockedDateRepository,
} from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
export {
  ROOM_RATE_OVERRIDE_REPOSITORY,
  type IRoomRateOverrideRepository,
} from '@src/modules/rooms/domain/repositories/room-rate-override.repository';
export { Room } from '@src/modules/rooms/domain/entities/room.entity';
export { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
export { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
export type { CreateRoomDto } from '@src/modules/rooms/applications/dto/createRoom.dto';
export type { CreateRoomBlockedDateDto } from '@src/modules/rooms/applications/dto/create-room-blocked-date.dto';
export type { CreateRoomRateOverrideDto } from '@src/modules/rooms/applications/dto/create-room-rate-override.dto';
export { RoomBlockedDateOutput } from '@src/modules/rooms/applications/dto/room-blocked-date.output';
export { RoomRateOverrideOutput } from '@src/modules/rooms/applications/dto/room-rate-override.output';
export { parseRoomBody } from '@src/modules/rooms/interfaces/http/parse-room-body';
export { parseKeptImages } from '@src/modules/rooms/interfaces/http/parse-kept-images';
export { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
export { RoomStayPricingService } from '@src/modules/rooms/applications/services/room-stay-pricing.service';
export {
  RoomProductSummaryService,
  type RoomProductSummary,
} from '@src/modules/rooms/applications/services/room-product-summary.service';
export { CreateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomCommand';
export { UpdateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomCommand';
export { DeleteRoomCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomCommand';
export { CreateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomTypeCommand';
export { UpdateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomTypeCommand';
export { DeleteRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomTypeCommand';
export { CreateRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomBlockedDateCommand';
export { DeleteRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomBlockedDateCommand';
export { CreateRoomRateOverrideCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomRateOverrideCommand';
export { DeleteRoomRateOverrideCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomRateOverrideCommand';
export { FindRoomQuery } from '@src/modules/rooms/applications/useCase/queries/FindRoomQuery';
export { ListRoomsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomsQuery';
export { ListRoomTypesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypesQuery';
export { ListRoomTypeOptionsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';
export { ListRoomBlockedDatesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomBlockedDatesQuery';
export { ListRoomRateOverridesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomRateOverridesQuery';
export { GetRoomPricingPreviewQuery } from '@src/modules/rooms/applications/useCase/queries/GetRoomPricingPreviewQuery';
