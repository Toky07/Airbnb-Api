import { Inject } from "@nestjs/common";
import { Room } from "../../domain/entities/room.entity";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { CreateRoomDto } from "../dto/createRoom.dto";
import { RoomOutput } from "../dto/room.output";
import { ENTITY_TYPE } from "../../../media/constant";
import { SaveEntityMediasUseCase } from "../../../media/applications/useCase/saveEntityMedias.usecase";
import { RoomMediaPresenter } from "../presenters/room-media.presenter";
import { GenerateRoomSlugService } from "../services/generate-room-slug.service";
import type { UploadFile } from "../../../media/types/upload-file";

export class CreateRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly saveEntityMedias: SaveEntityMediasUseCase,
        private readonly presenter: RoomMediaPresenter,
        private readonly generateSlug: GenerateRoomSlugService,
    ) {}

    async execute(
        createRoomDto: CreateRoomDto,
        images?: UploadFile[],
    ): Promise<RoomOutput> {
        const room = new Room(createRoomDto);
        room.slug = await this.generateSlug.execute(room.name);

        const createdRoom = await this.repository.create(room);

        if (images?.length) {
            await this.saveEntityMedias.execute(
                ENTITY_TYPE.ROOM,
                createdRoom.id!,
                images,
            );
        }

        return this.presenter.toOutput(createdRoom);
    }
}
