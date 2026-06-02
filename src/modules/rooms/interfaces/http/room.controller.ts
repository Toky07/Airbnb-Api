import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ENTITY_MEDIA_LIMITS, ENTITY_TYPE } from "../../../media/constant";
import { ListRoomsUseCase } from "../../applications/useCase/listRoom.usecase";
import { FindOneRoomUseCase } from "../../applications/useCase/findOneRoom.usecase";
import type { CreateRoomDto } from "../../applications/dto/createRoom.dto";
import { CreateRoomUseCase } from "../../applications/useCase/createRoom.usecase";
import { UpdateRoomUseCase } from "../../applications/useCase/updateRoom.usecase";
import { DeleteRoomUseCase } from "../../applications/useCase/deleteRoom.usecase";
import { parseRoomBody } from "./parse-room-body";
import type { UploadFile } from "../../../media/types/upload-file";

@Controller('rooms')
export class RoomController {
    constructor(
        private readonly listRoomUseCase: ListRoomsUseCase,
        private readonly findOneRoomUseCase: FindOneRoomUseCase,
        private readonly createRoomUseCase: CreateRoomUseCase,
        private readonly updateRoomUseCase: UpdateRoomUseCase,
        private readonly deleteRoomUseCase: DeleteRoomUseCase,
    ) {}

    @Get()
    async findAll() {
        return this.listRoomUseCase.execute();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return this.findOneRoomUseCase.execute(id);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
    async create(
        @Body() body: CreateRoomDto | Record<string, unknown>,
        @UploadedFiles() images?: UploadFile[],
    ) {
        const createRoomDto =
            typeof (body as CreateRoomDto).pricePerNight === 'number'
                ? (body as CreateRoomDto)
                : parseRoomBody(body as Record<string, unknown>);
        return this.createRoomUseCase.execute(createRoomDto, images);
    }

    @Put(':id')
    @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
    async update(
        @Param('id') id: number,
        @Body() body: CreateRoomDto | Record<string, unknown>,
        @UploadedFiles() images?: UploadFile[],
    ) {
        const updateRoomDto =
            typeof (body as CreateRoomDto).pricePerNight === 'number'
                ? (body as CreateRoomDto)
                : parseRoomBody(body as Record<string, unknown>);
        return this.updateRoomUseCase.execute(id, updateRoomDto, images);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<{ status: boolean }> {
        const status = await this.deleteRoomUseCase.execute(id);
        return { status };
    }
}
