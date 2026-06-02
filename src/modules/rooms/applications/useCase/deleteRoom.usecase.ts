import { Inject } from "@nestjs/common";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";

export class DeleteRoomUseCase {
    constructor(@Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository) {}

    async execute(id: number): Promise<boolean> {
        return this.repository.delete(id);
    }
}
