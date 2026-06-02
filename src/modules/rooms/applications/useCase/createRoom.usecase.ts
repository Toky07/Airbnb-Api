import { Inject } from "@nestjs/common";
import { Room } from "../../domain/entities/room.entity";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { CreateRoomDto } from "../dto/createRoom.dto";
import { RoomOutput } from "../dto/room.output";

export class CreateRoomUseCase {
    constructor(@Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository) {}

    async execute(createRoomDto: CreateRoomDto): Promise<RoomOutput> {
        const room = new Room(createRoomDto);

        const createdRoom = await this.repository.create(room);

        return RoomOutput.fromDomain(createdRoom);
    }
}
