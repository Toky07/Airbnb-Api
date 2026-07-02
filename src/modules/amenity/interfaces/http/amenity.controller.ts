import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import type {
  CreateAmenityDto,
  SyncAmenitiesDto,
  UpdateAmenityDto,
} from '../../applications/dto/create-amenity.dto';
import { AmenityOutput } from '../../applications/dto/amenity.output';
import { parseAmenityScope } from '../../applications/utils/parse-amenity-scope';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateAmenityCommand } from '../../applications/useCase/commands/CreateAmenityCommand';
import { UpdateAmenityCommand } from '../../applications/useCase/commands/UpdateAmenityCommand';
import { DeleteAmenityCommand } from '../../applications/useCase/commands/DeleteAmenityCommand';
import { SyncPropertyAmenitiesCommand } from '../../applications/useCase/commands/SyncPropertyAmenitiesCommand';
import { SyncRoomAmenitiesCommand } from '../../applications/useCase/commands/SyncRoomAmenitiesCommand';
import { ListAmenitiesQuery } from '../../applications/useCase/queries/ListAmenitiesQuery';
import { ListAmenityOptionsQuery } from '../../applications/useCase/queries/ListAmenityOptionsQuery';
import { ListPropertyAmenitiesQuery } from '../../applications/useCase/queries/ListPropertyAmenitiesQuery';
import { ListRoomAmenitiesQuery } from '../../applications/useCase/queries/ListRoomAmenitiesQuery';

@Controller('amenities')
export class AmenityController {
  @Get()
  @RequireSuperAdmin()
  list(@Query() query: Record<string, unknown>): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListAmenitiesQuery(parseAmenityScope(query.scope)));
  }

  @Get('options')
  @RequirePermissions('amenities.read')
  listOptions(@Query() query: Record<string, unknown>): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListAmenityOptionsQuery(parseAmenityScope(query.scope)));
  }

  @Get('properties/:propertyId')
  @RequirePermissions('properties.read')
  listForProperty(
    @Param('propertyId') propertyId: number,
  ): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListPropertyAmenitiesQuery(Number(propertyId)));
  }

  @Put('properties/:propertyId')
  @RequirePermissions('properties.update')
  syncForProperty(
    @Param('propertyId') propertyId: number,
    @Body() body: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    return CommandBus.execute(
      new SyncPropertyAmenitiesCommand(Number(propertyId), body),
    );
  }

  @Get('rooms/:roomId')
  @RequirePermissions('rooms.read')
  listForRoom(@Param('roomId') roomId: number): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListRoomAmenitiesQuery(Number(roomId)));
  }

  @Put('rooms/:roomId')
  @RequirePermissions('rooms.update')
  syncForRoom(
    @Param('roomId') roomId: number,
    @Body() body: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    return CommandBus.execute(new SyncRoomAmenitiesCommand(Number(roomId), body));
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreateAmenityDto): Promise<AmenityOutput> {
    return CommandBus.execute(new CreateAmenityCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdateAmenityDto,
  ): Promise<AmenityOutput> {
    return CommandBus.execute(new UpdateAmenityCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteAmenityCommand(Number(id)));
  }
}
