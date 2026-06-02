import { Inject } from "@nestjs/common";
import { type IRoomRepository, ROOM_REPOSITORY } from "../../domain/repositories/room.repository";
import { ENTITY_TYPE } from "../../../media/constant";
import { DeleteMediasByEntityUseCase } from "../../../media/applications/useCase/deleteMediasByEntity.usecase";

export class DeleteRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly deleteMediasByEntity: DeleteMediasByEntityUseCase,
    ) {}

    async execute(id: number): Promise<boolean> {
        await this.deleteMediasByEntity.execute(ENTITY_TYPE.ROOM, id);
        return this.repository.delete(id);
    }
}
