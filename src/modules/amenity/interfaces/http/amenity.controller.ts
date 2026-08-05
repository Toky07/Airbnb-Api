import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
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
import {
  CreateAmenitySwaggerDto,
  SyncAmenitiesSwaggerDto,
  UpdateAmenitySwaggerDto,
} from '../../../../shared/swagger/swagger-schemas.dto';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.AMENITIES)
@Controller('amenities')
export class AmenityController {
  @Get()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Liste complète des équipements (SuperAdmin)' })
  @ApiQuery({ name: 'scope', required: false, enum: ['room', 'property'] })
  list(@Query() query: Record<string, unknown>): Promise<AmenityOutput[]> {
    return QueryBus.execute(
      new ListAmenitiesQuery(parseAmenityScope(query.scope)),
    );
  }

  @Public()
  @Get('catalog')
  @ApiOperation({ summary: 'Catalogue public des équipements' })
  @ApiQuery({ name: 'scope', required: false, enum: ['room', 'property'] })
  listCatalog(
    @Query() query: Record<string, unknown>,
  ): Promise<AmenityOutput[]> {
    return QueryBus.execute(
      new ListAmenityOptionsQuery(parseAmenityScope(query.scope ?? 'room')),
    );
  }

  @Get('options')
  @RequirePermissions('amenities.read')
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Options équipements (admin)' })
  @ApiQuery({ name: 'scope', required: false, enum: ['room', 'property'] })
  listOptions(
    @Query() query: Record<string, unknown>,
  ): Promise<AmenityOutput[]> {
    return QueryBus.execute(
      new ListAmenityOptionsQuery(parseAmenityScope(query.scope)),
    );
  }

  @Get('properties/:propertyId')
  @RequirePermissions('properties.read')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Équipements d'un établissement" })
  listForProperty(
    @Param('propertyId') propertyId: number,
  ): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListPropertyAmenitiesQuery(Number(propertyId)));
  }

  @Put('properties/:propertyId')
  @RequirePermissions('properties.update')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Synchroniser les équipements d'un établissement" })
  syncForProperty(
    @Param('propertyId') propertyId: number,
    @Body() body: SyncAmenitiesSwaggerDto,
  ): Promise<AmenityOutput[]> {
    return CommandBus.execute(
      new SyncPropertyAmenitiesCommand(Number(propertyId), body),
    );
  }

  @Get('rooms/:roomId')
  @RequirePermissions('rooms.read')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Équipements d'une chambre" })
  listForRoom(@Param('roomId') roomId: number): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListRoomAmenitiesQuery(Number(roomId)));
  }

  @Put('rooms/:roomId')
  @RequirePermissions('rooms.update')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Synchroniser les équipements d'une chambre" })
  syncForRoom(
    @Param('roomId') roomId: number,
    @Body() body: SyncAmenitiesSwaggerDto,
  ): Promise<AmenityOutput[]> {
    return CommandBus.execute(
      new SyncRoomAmenitiesCommand(Number(roomId), body),
    );
  }

  @Post()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Créer un équipement' })
  create(@Body() body: CreateAmenitySwaggerDto): Promise<AmenityOutput> {
    return CommandBus.execute(new CreateAmenityCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Modifier un équipement' })
  update(
    @Param('id') id: number,
    @Body() body: UpdateAmenitySwaggerDto,
  ): Promise<AmenityOutput> {
    return CommandBus.execute(new UpdateAmenityCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Supprimer un équipement' })
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteAmenityCommand(Number(id)));
  }
}
