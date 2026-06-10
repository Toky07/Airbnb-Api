import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './infrastructure/entities/room.entity';
import { RoomTypeEntity } from './infrastructure/entities/room-type.entity';
import { ROOM_REPOSITORY } from './domain/repositories/room.repository';
import { ROOM_TYPE_REPOSITORY } from './domain/repositories/room-type.repository';
import { RoomRepository } from './infrastructure/repositories/room.repository';
import { RoomTypeRepository } from './infrastructure/repositories/room-type.repository';
import { ListRoomsUseCase } from './applications/useCase/listRoom.usecase';
import { RoomController } from './interfaces/http/room.controller';
import { RoomTypeController } from './interfaces/http/room-type.controller';
import { FindOneRoomUseCase } from './applications/useCase/findOneRoom.usecase';
import { CreateRoomUseCase } from './applications/useCase/createRoom.usecase';
import { UpdateRoomUseCase } from './applications/useCase/updateRoom.usecase';
import { DeleteRoomUseCase } from './applications/useCase/deleteRoom.usecase';
import { ListRoomTypesUseCase } from './applications/useCase/list-room-types.usecase';
import { ListRoomTypeOptionsUseCase } from './applications/useCase/list-room-type-options.usecase';
import { CreateRoomTypeUseCase } from './applications/useCase/create-room-type.usecase';
import { UpdateRoomTypeUseCase } from './applications/useCase/update-room-type.usecase';
import { DeleteRoomTypeUseCase } from './applications/useCase/delete-room-type.usecase';
import { RoomTypesSeedService } from './infrastructure/seed/room-types.seed';
import { RoomSlugsSeedService } from './infrastructure/seed/room-slugs.seed';
import { MediaModule } from '../media/media.module';
import { RoomMediaPresenter } from './applications/presenters/room-media.presenter';
import { RoomProductSummaryService } from './applications/services/room-product-summary.service';
import { GenerateRoomSlugService } from './applications/services/generate-room-slug.service';
import { ReservationOrmEntity } from '../reservation/infrastructure/entities/reservation.orm-entity';
import { AmenityModule } from '../amenity/amenity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomEntity, RoomTypeEntity, ReservationOrmEntity]),
    MediaModule,
    forwardRef(() => AmenityModule),
  ],
  controllers: [RoomController, RoomTypeController],
  providers: [
    ListRoomsUseCase,
    FindOneRoomUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    DeleteRoomUseCase,
    ListRoomTypesUseCase,
    ListRoomTypeOptionsUseCase,
    CreateRoomTypeUseCase,
    UpdateRoomTypeUseCase,
    DeleteRoomTypeUseCase,
    RoomTypesSeedService,
    RoomSlugsSeedService,
    RoomMediaPresenter,
    RoomProductSummaryService,
    GenerateRoomSlugService,
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomRepository,
    },
    {
      provide: ROOM_TYPE_REPOSITORY,
      useClass: RoomTypeRepository,
    },
  ],
  exports: [
    ROOM_REPOSITORY,
    ROOM_TYPE_REPOSITORY,
    ListRoomTypeOptionsUseCase,
    ListRoomsUseCase,
    FindOneRoomUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    DeleteRoomUseCase,
    RoomMediaPresenter,
    RoomProductSummaryService,
  ],
})
export class RoomsModule {}
