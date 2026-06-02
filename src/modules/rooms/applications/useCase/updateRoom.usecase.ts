import { Inject } from "@nestjs/common";
import { ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import type { IRoomRepository } from "../../domain/repositories/room.repository";
import { CreateRoomDto } from "../dto/createRoom.dto";

export class UpdateRoomUseCase {
    constructor(@Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository) {}

    async execute(id: number, updateRoomDto: CreateRoomDto): Promise<RoomOutput> {
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

        const updatedRoom = await this.repository.update(room);

        return RoomOutput.fromDomain(updatedRoom);
    }
}
