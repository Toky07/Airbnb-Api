import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import type {
  CreateRoomTypeDto,
  UpdateRoomTypeDto,
} from '../../applications/dto/create-room-type.dto';
import { RoomTypeOutput } from '../../applications/dto/room-type.output';
import { CreateRoomTypeUseCase } from '../../applications/useCase/create-room-type.usecase';
import { DeleteRoomTypeUseCase } from '../../applications/useCase/delete-room-type.usecase';
import { ListRoomTypeOptionsUseCase } from '../../applications/useCase/list-room-type-options.usecase';
import { ListRoomTypesUseCase } from '../../applications/useCase/list-room-types.usecase';
import { UpdateRoomTypeUseCase } from '../../applications/useCase/update-room-type.usecase';

@Controller('room-types')
export class RoomTypeController {
  constructor(
    private readonly listRoomTypesUseCase: ListRoomTypesUseCase,
    private readonly listRoomTypeOptionsUseCase: ListRoomTypeOptionsUseCase,
    private readonly createRoomTypeUseCase: CreateRoomTypeUseCase,
    private readonly updateRoomTypeUseCase: UpdateRoomTypeUseCase,
    private readonly deleteRoomTypeUseCase: DeleteRoomTypeUseCase,
  ) {}

  @Get()
  @RequireSuperAdmin()
  list(): Promise<RoomTypeOutput[]> {
    return this.listRoomTypesUseCase.execute();
  }

  @Get('options')
  @RequirePermissions('rooms.read')
  listOptions(): Promise<RoomTypeOutput[]> {
    return this.listRoomTypeOptionsUseCase.execute();
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreateRoomTypeDto): Promise<RoomTypeOutput> {
    return this.createRoomTypeUseCase.execute(body);
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdateRoomTypeDto,
  ): Promise<RoomTypeOutput> {
    return this.updateRoomTypeUseCase.execute(Number(id), body);
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deleteRoomTypeUseCase.execute(Number(id));
  }
}
