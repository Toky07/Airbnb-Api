import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { CreatePropertyDto } from '../../../properties/applications/dto/createProperty.dto';
import { parsePropertyBody } from '../../../properties/interfaces/http/parse-property-body';
import { parseRoomBody } from '../../../rooms/interfaces/http/parse-room-body';
import { parseKeptImages } from '../../../rooms/interfaces/http/parse-kept-images';
import type { CreateRoomDto } from '../../../rooms/applications/dto/createRoom.dto';
import { ENTITY_MEDIA_LIMITS, ENTITY_TYPE } from '../../../media/constant';
import type { UploadFile } from '../../../media/types/upload-file';
import { ListPropertyTypeOptionsQuery } from '../../../properties/applications/useCase/queries/ListPropertyTypeOptionsQuery';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { ListRoomTypeOptionsQuery } from '../../../rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';
import { AMENITY_SCOPE } from '../../../amenity/domain/constants/amenity-scope.constant';
import type { SyncAmenitiesDto } from '../../../amenity/applications/dto/create-amenity.dto';
import { GetHostProfileUseCase } from '../../application/useCase/get-host-profile.usecase';
import {
  CreateHostPropertyUseCase,
  GetHostPropertyUseCase,
  ListHostPropertiesUseCase,
  UpdateHostPropertyUseCase,
} from '../../application/useCase/host-property.usecase';
import {
  CreateHostRoomUseCase,
  DeleteHostRoomUseCase,
  ListHostRoomsUseCase,
  UpdateHostRoomUseCase,
} from '../../application/useCase/host-rooms.usecase';
import {
  HostGetPropertyAmenitiesUseCase,
  HostGetRoomAmenitiesUseCase,
  HostListAmenityOptionsUseCase,
  HostSyncPropertyAmenitiesUseCase,
  HostSyncRoomAmenitiesUseCase,
} from '../../application/useCase/host-amenity.usecase';

function parseRequiredPropertyId(query: Record<string, unknown>): number {
  const raw = query.propertyId;
  const propertyId = Number(raw);
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    throw new BadRequestException('propertyId requis');
  }
  return propertyId;
}

@Controller('host')
export class HostController {
  constructor(
    private readonly getHostProfileUseCase: GetHostProfileUseCase,
    private readonly listHostPropertiesUseCase: ListHostPropertiesUseCase,
    private readonly getHostPropertyUseCase: GetHostPropertyUseCase,
    private readonly createHostPropertyUseCase: CreateHostPropertyUseCase,
    private readonly updateHostPropertyUseCase: UpdateHostPropertyUseCase,
    private readonly listHostRoomsUseCase: ListHostRoomsUseCase,
    private readonly createHostRoomUseCase: CreateHostRoomUseCase,
    private readonly updateHostRoomUseCase: UpdateHostRoomUseCase,
    private readonly deleteHostRoomUseCase: DeleteHostRoomUseCase,
    private readonly hostListAmenityOptionsUseCase: HostListAmenityOptionsUseCase,
    private readonly hostGetPropertyAmenitiesUseCase: HostGetPropertyAmenitiesUseCase,
    private readonly hostSyncPropertyAmenitiesUseCase: HostSyncPropertyAmenitiesUseCase,
    private readonly hostGetRoomAmenitiesUseCase: HostGetRoomAmenitiesUseCase,
    private readonly hostSyncRoomAmenitiesUseCase: HostSyncRoomAmenitiesUseCase,
  ) {}

  @Get('profile')
  @RequirePermissions('host.dashboard.read')
  profile(@Req() request: { user: JwtPayload }) {
    return this.getHostProfileUseCase.execute(request.user);
  }

  @Get('properties')
  @RequirePermissions('host.property.read')
  properties(@Req() request: { user: JwtPayload }) {
    return this.listHostPropertiesUseCase.execute(request.user);
  }

  @Get('properties/:id')
  @RequirePermissions('host.property.read')
  property(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return this.getHostPropertyUseCase.execute(request.user, Number(id));
  }

  @Post('properties')
  @RequirePermissions('host.property.create')
  @UseInterceptors(FileInterceptor('image'))
  createProperty(
    @Req() request: { user: JwtPayload },
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ) {
    const dto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body as Record<string, unknown>);
    const { ownerId: _ownerId, ...fields } = dto;
    return this.createHostPropertyUseCase.execute(request.user, fields, image);
  }

  @Put('properties/:id')
  @RequirePermissions('host.property.update')
  @UseInterceptors(FileInterceptor('image'))
  updateProperty(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ) {
    const dto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body as Record<string, unknown>);
    const { ownerId: _ownerId, ...fields } = dto;
    return this.updateHostPropertyUseCase.execute(
      request.user,
      Number(id),
      fields,
      image,
    );
  }

  @Get('rooms')
  @RequirePermissions('host.rooms.read')
  rooms(
    @Req() request: { user: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return this.listHostRoomsUseCase.execute(
      request.user,
      propertyId,
      parsePaginationQuery(query),
    );
  }

  @Post('rooms')
  @RequirePermissions('host.rooms.create')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  createRoom(
    @Req() request: { user: JwtPayload },
    @Query() query: Record<string, unknown>,
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const propertyId = parseRequiredPropertyId(query);
    const parsed =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(body as Record<string, unknown>);
    const { property: _property, ...fields } = parsed;
    return this.createHostRoomUseCase.execute(
      request.user,
      propertyId,
      fields,
      images,
    );
  }

  @Put('rooms/:id')
  @RequirePermissions('host.rooms.update')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  updateRoom(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const propertyId = parseRequiredPropertyId(query);
    const rawBody = body as Record<string, unknown>;
    const parsed =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(rawBody);
    const { property: _property, ...fields } = parsed;
    const keptImages = parseKeptImages(rawBody);
    return this.updateHostRoomUseCase.execute(
      request.user,
      propertyId,
      Number(id),
      fields,
      images,
      keptImages,
    );
  }

  @Delete('rooms/:id')
  @RequirePermissions('host.rooms.delete')
  deleteRoom(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return this.deleteHostRoomUseCase.execute(
      request.user,
      propertyId,
      Number(id),
    );
  }

  @Get('property-types/options')
  @RequirePermissions('host.property.read')
  propertyTypeOptions() {
    return QueryBus.execute(new ListPropertyTypeOptionsQuery());
  }

  @Get('room-types/options')
  @RequirePermissions('host.rooms.read')
  roomTypeOptions() {
    return QueryBus.execute(new ListRoomTypeOptionsQuery());
  }

  @Get('amenities/property/options')
  @RequirePermissions('host.property.read')
  propertyAmenityOptions() {
    return this.hostListAmenityOptionsUseCase.execute(AMENITY_SCOPE.PROPERTY);
  }

  @Get('amenities/room/options')
  @RequirePermissions('host.rooms.read')
  roomAmenityOptions() {
    return this.hostListAmenityOptionsUseCase.execute(AMENITY_SCOPE.ROOM);
  }

  @Get('properties/:id/amenities')
  @RequirePermissions('host.property.read')
  propertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return this.hostGetPropertyAmenitiesUseCase.execute(request.user, Number(id));
  }

  @Put('properties/:id/amenities')
  @RequirePermissions('host.property.update')
  syncPropertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: SyncAmenitiesDto,
  ) {
    return this.hostSyncPropertyAmenitiesUseCase.execute(
      request.user,
      Number(id),
      body,
    );
  }

  @Get('rooms/:id/amenities')
  @RequirePermissions('host.rooms.read')
  roomAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return this.hostGetRoomAmenitiesUseCase.execute(
      request.user,
      propertyId,
      Number(id),
    );
  }

  @Put('rooms/:id/amenities')
  @RequirePermissions('host.rooms.update')
  syncRoomAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
    @Body() body: SyncAmenitiesDto,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return this.hostSyncRoomAmenitiesUseCase.execute(
      request.user,
      propertyId,
      Number(id),
      body,
    );
  }
}
