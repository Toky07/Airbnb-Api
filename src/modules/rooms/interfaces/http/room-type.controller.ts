import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/modules/authentication/contracts';
import { RequireSuperAdmin } from '@src/modules/authentication/contracts';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomTypeCommand';
import { UpdateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomTypeCommand';
import { DeleteRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomTypeCommand';
import { ListRoomTypesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypesQuery';
import { ListRoomTypeOptionsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';
import {
  CreateRoomTypeSwaggerDto,
  UpdateRoomTypeSwaggerDto,
} from '@src/shared/swagger/swagger-schemas.dto';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.ROOM_TYPES)
@Controller('room-types')
export class RoomTypeController {
  @Get()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Lister tous les types de chambre (SuperAdmin)' })
  list(): Promise<RoomTypeOutput[]> {
    return QueryBus.execute(new ListRoomTypesQuery());
  }

  @Public()
  @Get('options')
  @ApiOperation({ summary: 'Options types de chambre (public)' })
  listOptions(): Promise<RoomTypeOutput[]> {
    return QueryBus.execute(new ListRoomTypeOptionsQuery());
  }

  @Post()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Créer un type de chambre' })
  create(@Body() body: CreateRoomTypeSwaggerDto): Promise<RoomTypeOutput> {
    return CommandBus.execute(new CreateRoomTypeCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Modifier un type de chambre' })
  update(
    @Param('id') id: number,
    @Body() body: UpdateRoomTypeSwaggerDto,
  ): Promise<RoomTypeOutput> {
    return CommandBus.execute(new UpdateRoomTypeCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Supprimer un type de chambre' })
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteRoomTypeCommand(Number(id)));
  }
}
