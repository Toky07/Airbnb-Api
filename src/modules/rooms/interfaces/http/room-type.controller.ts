import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import type {
  CreateRoomTypeDto,
  UpdateRoomTypeDto,
} from '../../applications/dto/create-room-type.dto';
import { RoomTypeOutput } from '../../applications/dto/room-type.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateRoomTypeCommand } from '../../applications/useCase/commands/CreateRoomTypeCommand';
import { UpdateRoomTypeCommand } from '../../applications/useCase/commands/UpdateRoomTypeCommand';
import { DeleteRoomTypeCommand } from '../../applications/useCase/commands/DeleteRoomTypeCommand';
import { ListRoomTypesQuery } from '../../applications/useCase/queries/ListRoomTypesQuery';
import { ListRoomTypeOptionsQuery } from '../../applications/useCase/queries/ListRoomTypeOptionsQuery';

@Controller('room-types')
export class RoomTypeController {
  @Get()
  @RequireSuperAdmin()
  list(): Promise<RoomTypeOutput[]> {
    return QueryBus.execute(new ListRoomTypesQuery());
  }

  @Get('options')
  @RequirePermissions('rooms.read')
  listOptions(): Promise<RoomTypeOutput[]> {
    return QueryBus.execute(new ListRoomTypeOptionsQuery());
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreateRoomTypeDto): Promise<RoomTypeOutput> {
    return CommandBus.execute(new CreateRoomTypeCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdateRoomTypeDto,
  ): Promise<RoomTypeOutput> {
    return CommandBus.execute(new UpdateRoomTypeCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteRoomTypeCommand(Number(id)));
  }
}
