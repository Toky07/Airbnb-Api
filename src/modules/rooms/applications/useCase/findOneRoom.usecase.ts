import { Inject } from "@nestjs/common";
import { ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { type IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { RoomMediaPresenter } from "../presenters/room-media.presenter";

export class FindOneRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly presenter: RoomMediaPresenter,
    ) {}

    async execute(id: number): Promise<RoomOutput> {
        const room = await this.repository.findById(id);

        if (!room) {
            throw new Error('Room not found');
        }

        return this.presenter.toOutput(room!);
    }
}
