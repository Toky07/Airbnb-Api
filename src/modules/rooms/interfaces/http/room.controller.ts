import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ListRoomsUseCase } from "../../applications/useCase/listRoom.usecase";
import { FindOneRoomUseCase } from "../../applications/useCase/findOneRoom.usecase";
import type { CreateRoomDto } from "../../applications/dto/createRoom.dto";
import { CreateRoomUseCase } from "../../applications/useCase/createRoom.usecase";
import { UpdateRoomUseCase } from "../../applications/useCase/updateRoom.usecase";
import { DeleteRoomUseCase } from "../../applications/useCase/deleteRoom.usecase";

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
    async create(@Body() createRoomDto: CreateRoomDto) {
        return this.createRoomUseCase.execute(createRoomDto);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateRoomDto: CreateRoomDto) {
        return this.updateRoomUseCase.execute(id, updateRoomDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<{ status: boolean }> {
        const status = await this.deleteRoomUseCase.execute(id);
        return { status };
    }
}
