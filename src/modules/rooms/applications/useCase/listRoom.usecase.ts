import { Inject } from "@nestjs/common";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";

export class ListRoomsUseCase {
    constructor(@Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository) {}

    async execute(): Promise<RoomOutput[]> {
        const rooms = await this.repository.findAll();

        return rooms.map(RoomOutput.fromDomain);
    }
}
