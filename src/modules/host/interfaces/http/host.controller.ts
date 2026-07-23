import {
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
import { parseRequiredPropertyId } from '../../../../shared/http/parse-required-property-id';
import type { CreatePropertyDto } from '../../../properties/applications/dto/createProperty.dto';
import { parsePropertyBody } from '../../../properties/interfaces/http/parse-property-body';
import { parseRoomBody } from '../../../rooms/interfaces/http/parse-room-body';
import { parseKeptImages } from '../../../rooms/interfaces/http/parse-kept-images';
import type { CreateRoomDto } from '../../../rooms/applications/dto/createRoom.dto';
import { ENTITY_MEDIA_LIMITS, ENTITY_TYPE } from '../../../media/constant';
import type { UploadFile } from '../../../media/types/upload-file';
import { ListPropertyTypeOptionsQuery } from '../../../properties/applications/useCase/queries/ListPropertyTypeOptionsQuery';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { ListRoomTypeOptionsQuery } from '../../../rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';
import { AMENITY_SCOPE } from '../../../amenity/domain/constants/amenity-scope.constant';
import type { SyncAmenitiesDto } from '../../../amenity/applications/dto/create-amenity.dto';
import { GetHostProfileQuery } from '../../applications/useCase/queries/GetHostProfileQuery';
import { ListHostPropertiesQuery } from '../../applications/useCase/queries/ListHostPropertiesQuery';
import { GetHostPropertyQuery } from '../../applications/useCase/queries/GetHostPropertyQuery';
import { CreateHostPropertyCommand } from '../../applications/useCase/commands/CreateHostPropertyCommand';
import { UpdateHostPropertyCommand } from '../../applications/useCase/commands/UpdateHostPropertyCommand';
import { ListHostRoomsQuery } from '../../applications/useCase/queries/ListHostRoomsQuery';
import { CreateHostRoomCommand } from '../../applications/useCase/commands/CreateHostRoomCommand';
import { UpdateHostRoomCommand } from '../../applications/useCase/commands/UpdateHostRoomCommand';
import { DeleteHostRoomCommand } from '../../applications/useCase/commands/DeleteHostRoomCommand';
import { ListHostAmenityOptionsQuery } from '../../applications/useCase/queries/ListHostAmenityOptionsQuery';
import { GetHostPropertyAmenitiesQuery } from '../../applications/useCase/queries/GetHostPropertyAmenitiesQuery';
import { SyncHostPropertyAmenitiesCommand } from '../../applications/useCase/commands/SyncHostPropertyAmenitiesCommand';
import { GetHostRoomAmenitiesQuery } from '../../applications/useCase/queries/GetHostRoomAmenitiesQuery';
import { SyncHostRoomAmenitiesCommand } from '../../applications/useCase/commands/SyncHostRoomAmenitiesCommand';
import { ListHostRoomBlockedDatesQuery } from '../../applications/useCase/queries/ListHostRoomBlockedDatesQuery';
import { CreateHostRoomBlockedDateCommand } from '../../applications/useCase/commands/CreateHostRoomBlockedDateCommand';
import { DeleteHostRoomBlockedDateCommand } from '../../applications/useCase/commands/DeleteHostRoomBlockedDateCommand';
import type { CreateRoomBlockedDateDto } from '../../../rooms/applications/dto/create-room-blocked-date.dto';
import { CancelReservationCommand } from '../../../reservation/applications/useCase/commands/CancelReservationCommand';
import { MarkReservationNoShowCommand } from '../../../reservation/applications/useCase/commands/MarkReservationNoShowCommand';

@Controller('host')
export class HostController {
  @Get('profile')
  @RequirePermissions('host.dashboard.read')
  profile(@Req() request: { user: JwtPayload }) {
    return QueryBus.execute(new GetHostProfileQuery(request.user));
  }

  @Get('properties')
  @RequirePermissions('host.property.read')
  properties(@Req() request: { user: JwtPayload }) {
    return QueryBus.execute(new ListHostPropertiesQuery(request.user));
  }

  @Get('properties/:id')
  @RequirePermissions('host.property.read')
  property(@Req() request: { user: JwtPayload }, @Param('id') id: number) {
    return QueryBus.execute(new GetHostPropertyQuery(request.user, Number(id)));
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
        : parsePropertyBody(body);
    const { ownerId: _ownerId, ...fields } = dto;
    return CommandBus.execute(
      new CreateHostPropertyCommand(request.user, fields, image),
    );
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
        : parsePropertyBody(body);
    const { ownerId: _ownerId, ...fields } = dto;
    return CommandBus.execute(
      new UpdateHostPropertyCommand(request.user, Number(id), fields, image),
    );
  }

  @Get('rooms')
  @RequirePermissions('host.rooms.read')
  rooms(
    @Req() request: { user: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return QueryBus.execute(
      new ListHostRoomsQuery(
        request.user,
        propertyId,
        parsePaginationQuery(query),
      ),
    );
  }

  @Post('rooms')
  @RequirePermissions('host.rooms.create')
  @UseInterceptors(
    FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]),
  )
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
        : parseRoomBody(body);
    const { property: _property, ...fields } = parsed;
    return CommandBus.execute(
      new CreateHostRoomCommand(request.user, propertyId, fields, images),
    );
  }

  @Put('rooms/:id')
  @RequirePermissions('host.rooms.update')
  @UseInterceptors(
    FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]),
  )
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
    return CommandBus.execute(
      new UpdateHostRoomCommand(
        request.user,
        propertyId,
        Number(id),
        fields,
        images,
        keptImages,
      ),
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
    return CommandBus.execute(
      new DeleteHostRoomCommand(request.user, propertyId, Number(id)),
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
    return QueryBus.execute(
      new ListHostAmenityOptionsQuery(AMENITY_SCOPE.PROPERTY),
    );
  }

  @Get('amenities/room/options')
  @RequirePermissions('host.rooms.read')
  roomAmenityOptions() {
    return QueryBus.execute(
      new ListHostAmenityOptionsQuery(AMENITY_SCOPE.ROOM),
    );
  }

  @Get('properties/:id/amenities')
  @RequirePermissions('host.property.read')
  propertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return QueryBus.execute(
      new GetHostPropertyAmenitiesQuery(request.user, Number(id)),
    );
  }

  @Put('properties/:id/amenities')
  @RequirePermissions('host.property.update')
  syncPropertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: SyncAmenitiesDto,
  ) {
    return CommandBus.execute(
      new SyncHostPropertyAmenitiesCommand(request.user, Number(id), body),
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
    return QueryBus.execute(
      new GetHostRoomAmenitiesQuery(request.user, propertyId, Number(id)),
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
    return CommandBus.execute(
      new SyncHostRoomAmenitiesCommand(
        request.user,
        propertyId,
        Number(id),
        body,
      ),
    );
  }

  @Get('rooms/:id/blocked-dates')
  @RequirePermissions('host.rooms.read')
  listRoomBlockedDates(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return QueryBus.execute(
      new ListHostRoomBlockedDatesQuery(request.user, propertyId, Number(id)),
    );
  }

  @Post('rooms/:id/blocked-dates')
  @RequirePermissions('host.rooms.update')
  createRoomBlockedDate(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
    @Body() body: CreateRoomBlockedDateDto,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return CommandBus.execute(
      new CreateHostRoomBlockedDateCommand(
        request.user,
        propertyId,
        Number(id),
        body,
      ),
    );
  }

  @Delete('rooms/:id/blocked-dates/:blockedDateId')
  @RequirePermissions('host.rooms.update')
  deleteRoomBlockedDate(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Param('blockedDateId') blockedDateId: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return CommandBus.execute(
      new DeleteHostRoomBlockedDateCommand(
        request.user,
        propertyId,
        Number(id),
        Number(blockedDateId),
      ),
    );
  }

  @Post('reservations/:id/cancel')
  @RequirePermissions('host.reservations.read')
  cancelReservation(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return CommandBus.execute(
      new CancelReservationCommand(Number(id), {
        authId: request.user.sub,
        canCancelAll: false,
        canCancelHost: true,
      }),
    );
  }

  @Post('reservations/:id/no-show')
  @RequirePermissions('host.reservations.read')
  markReservationNoShow(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return CommandBus.execute(
      new MarkReservationNoShowCommand(Number(id), request.user.sub),
    );
  }
}
