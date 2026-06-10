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
import { CreateAmenityUseCase } from '../../applications/useCase/create-amenity.usecase';
import { DeleteAmenityUseCase } from '../../applications/useCase/delete-amenity.usecase';
import { ListAmenitiesUseCase } from '../../applications/useCase/list-amenities.usecase';
import { ListAmenityOptionsUseCase } from '../../applications/useCase/list-amenity-options.usecase';
import { ListPropertyAmenitiesUseCase } from '../../applications/useCase/list-property-amenities.usecase';
import { ListRoomAmenitiesUseCase } from '../../applications/useCase/list-room-amenities.usecase';
import { SyncPropertyAmenitiesUseCase } from '../../applications/useCase/sync-property-amenities.usecase';
import { SyncRoomAmenitiesUseCase } from '../../applications/useCase/sync-room-amenities.usecase';
import { UpdateAmenityUseCase } from '../../applications/useCase/update-amenity.usecase';

@Controller('amenities')
export class AmenityController {
  constructor(
    private readonly listAmenitiesUseCase: ListAmenitiesUseCase,
    private readonly listAmenityOptionsUseCase: ListAmenityOptionsUseCase,
    private readonly createAmenityUseCase: CreateAmenityUseCase,
    private readonly updateAmenityUseCase: UpdateAmenityUseCase,
    private readonly deleteAmenityUseCase: DeleteAmenityUseCase,
    private readonly listPropertyAmenitiesUseCase: ListPropertyAmenitiesUseCase,
    private readonly syncPropertyAmenitiesUseCase: SyncPropertyAmenitiesUseCase,
    private readonly listRoomAmenitiesUseCase: ListRoomAmenitiesUseCase,
    private readonly syncRoomAmenitiesUseCase: SyncRoomAmenitiesUseCase,
  ) {}

  @Get()
  @RequireSuperAdmin()
  list(@Query() query: Record<string, unknown>): Promise<AmenityOutput[]> {
    return this.listAmenitiesUseCase.execute(parseAmenityScope(query.scope));
  }

  @Get('options')
  @RequirePermissions('amenities.read')
  listOptions(@Query() query: Record<string, unknown>): Promise<AmenityOutput[]> {
    return this.listAmenityOptionsUseCase.execute(parseAmenityScope(query.scope));
  }

  @Get('properties/:propertyId')
  @RequirePermissions('properties.read')
  listForProperty(
    @Param('propertyId') propertyId: number,
  ): Promise<AmenityOutput[]> {
    return this.listPropertyAmenitiesUseCase.execute(Number(propertyId));
  }

  @Put('properties/:propertyId')
  @RequirePermissions('properties.update')
  syncForProperty(
    @Param('propertyId') propertyId: number,
    @Body() body: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    return this.syncPropertyAmenitiesUseCase.execute(Number(propertyId), body);
  }

  @Get('rooms/:roomId')
  @RequirePermissions('rooms.read')
  listForRoom(@Param('roomId') roomId: number): Promise<AmenityOutput[]> {
    return this.listRoomAmenitiesUseCase.execute(Number(roomId));
  }

  @Put('rooms/:roomId')
  @RequirePermissions('rooms.update')
  syncForRoom(
    @Param('roomId') roomId: number,
    @Body() body: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    return this.syncRoomAmenitiesUseCase.execute(Number(roomId), body);
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreateAmenityDto): Promise<AmenityOutput> {
    return this.createAmenityUseCase.execute(body);
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdateAmenityDto,
  ): Promise<AmenityOutput> {
    return this.updateAmenityUseCase.execute(Number(id), body);
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deleteAmenityUseCase.execute(Number(id));
  }
}
