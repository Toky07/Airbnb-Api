import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './infrastructure/entities/room.entity';
import { ROOM_REPOSITORY } from './domain/repositories/room.repository';
import { RoomRepository } from './infrastructure/repositories/room.repository';
import { ListRoomsUseCase } from './applications/useCase/listRoom.usecase';
import { RoomController } from './interfaces/http/room.controller';
import { FindOneRoomUseCase } from './applications/useCase/findOneRoom.usecase';
import { CreateRoomUseCase } from './applications/useCase/createRoom.usecase';
import { UpdateRoomUseCase } from './applications/useCase/updateRoom.usecase';
import { DeleteRoomUseCase } from './applications/useCase/deleteRoom.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity])],
  controllers: [RoomController],
  providers: [
    ListRoomsUseCase,
    FindOneRoomUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    DeleteRoomUseCase,
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomRepository,
    }
  ],
})
export class RoomsModule {}
