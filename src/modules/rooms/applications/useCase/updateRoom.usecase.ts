import { Inject } from "@nestjs/common";
import { ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import type { IRoomRepository } from "../../domain/repositories/room.repository";
import { CreateRoomDto } from "../dto/createRoom.dto";
import { ENTITY_TYPE } from "../../../media/constant";
import { SyncEntityMediasUseCase } from "../../../media/applications/useCase/syncEntityMedias.usecase";
import { RoomMediaPresenter } from "../presenters/room-media.presenter";
import type { UploadFile } from "../../../media/types/upload-file";

export class UpdateRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly syncEntityMedias: SyncEntityMediasUseCase,
        private readonly presenter: RoomMediaPresenter,
    ) {}

    async execute(
        id: number,
        updateRoomDto: CreateRoomDto,
        images?: UploadFile[],
        keptImagePaths?: string[],
    ): Promise<RoomOutput> {
        const room = await this.repository.findById(id);

        if (!room) {
            throw new Error('Room not found');
        }

        room.name = updateRoomDto.name;
        room.description = updateRoomDto.description;
        room.pricePerNight = updateRoomDto.pricePerNight;
        room.maxGuests = updateRoomDto.maxGuests;
        room.bedrooms = updateRoomDto.bedrooms;
        room.bathrooms = updateRoomDto.bathrooms;
        room.beds = updateRoomDto.beds;
        room.quantity = updateRoomDto.quantity;
        room.size = updateRoomDto.size;
        room.status = updateRoomDto.status;
        room.property = updateRoomDto.property;
        room.roomTypeId = updateRoomDto.roomTypeId ?? null;
        room.roomType = null;

        const updatedRoom = await this.repository.update(room);

        if (keptImagePaths !== undefined || images?.length) {
            await this.syncEntityMedias.execute(ENTITY_TYPE.ROOM, updatedRoom.id!, {
                keptPaths: keptImagePaths ?? [],
                newFiles: images,
            });
        }

        return this.presenter.toOutput(updatedRoom);
    }
}
