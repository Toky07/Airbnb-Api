import { Inject } from "@nestjs/common";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { RoomMediaPresenter } from "../presenters/room-media.presenter";

export class ListRoomsUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly presenter: RoomMediaPresenter,
    ) {}

    async execute(): Promise<RoomOutput[]> {
        const rooms = await this.repository.findAll();

        return Promise.all(rooms.map((room) => this.presenter.toOutput(room)));
    }
}
