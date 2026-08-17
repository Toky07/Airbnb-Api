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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import { parseRequiredPropertyId } from './parse-required-property-id';
import { parseRoomBody } from '@src/modules/rooms/contracts';
import { parseKeptImages } from '@src/modules/rooms/contracts';
import type { CreateRoomDto } from '@src/modules/rooms/contracts';
import {
  ENTITY_MEDIA_LIMITS,
  ENTITY_TYPE,
  getImageMulterOptions,
} from '@src/modules/media/contracts';
import type { UploadFile } from '@src/modules/media/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { ListRoomTypeOptionsQuery } from '@src/modules/rooms/contracts';
import { AMENITY_SCOPE } from '@src/modules/amenity/contracts';
import type { SyncAmenitiesDto } from '@src/modules/amenity/contracts';
import type { CreateRoomBlockedDateDto } from '@src/modules/rooms/contracts';
import type { CreateRoomRateOverrideDto } from '@src/modules/rooms/contracts';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';
import { ListHostRoomsQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomsQuery';
import { CreateHostRoomCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomCommand';
import { UpdateHostRoomCommand } from '@src/modules/host/applications/useCase/commands/UpdateHostRoomCommand';
import { DeleteHostRoomCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomCommand';
import { ListHostAmenityOptionsQuery } from '@src/modules/host/applications/useCase/queries/ListHostAmenityOptionsQuery';
import { GetHostRoomAmenitiesQuery } from '@src/modules/host/applications/useCase/queries/GetHostRoomAmenitiesQuery';
import { SyncHostRoomAmenitiesCommand } from '@src/modules/host/applications/useCase/commands/SyncHostRoomAmenitiesCommand';
import { ListHostRoomBlockedDatesQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomBlockedDatesQuery';
import { CreateHostRoomBlockedDateCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomBlockedDateCommand';
import { DeleteHostRoomBlockedDateCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomBlockedDateCommand';
import { ListHostRoomRateOverridesQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomRateOverridesQuery';
import { CreateHostRoomRateOverrideCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomRateOverrideCommand';
import { DeleteHostRoomRateOverrideCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomRateOverrideCommand';

@ApiTags(SWAGGER_TAGS.HOST)
@ApiJwtAuth()
@Controller('host')
export class HostRoomsController {
  @Get('rooms')
  @RequirePermissions('host.rooms.read')
  @ApiOperation({ summary: "Chambres d'un établissement" })
  @ApiQuery({ name: 'propertyId', required: true, type: Number })
  @ApiPaginationQuery()
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
    FilesInterceptor(
      'images',
      ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM],
      getImageMulterOptions(),
    ),
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
    FilesInterceptor(
      'images',
      ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM],
      getImageMulterOptions(),
    ),
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

  @Get('room-types/options')
  @RequirePermissions('host.rooms.read')
  roomTypeOptions() {
    return QueryBus.execute(new ListRoomTypeOptionsQuery());
  }

  @Get('amenities/room/options')
  @RequirePermissions('host.rooms.read')
  roomAmenityOptions() {
    return QueryBus.execute(
      new ListHostAmenityOptionsQuery(AMENITY_SCOPE.ROOM),
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

  @Get('rooms/:id/rate-overrides')
  @RequirePermissions('host.rooms.read')
  listRoomRateOverrides(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return QueryBus.execute(
      new ListHostRoomRateOverridesQuery(request.user, propertyId, Number(id)),
    );
  }

  @Post('rooms/:id/rate-overrides')
  @RequirePermissions('host.rooms.update')
  createRoomRateOverride(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Query() query: Record<string, unknown>,
    @Body() body: CreateRoomRateOverrideDto,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return CommandBus.execute(
      new CreateHostRoomRateOverrideCommand(
        request.user,
        propertyId,
        Number(id),
        body,
      ),
    );
  }

  @Delete('rooms/:id/rate-overrides/:rateOverrideId')
  @RequirePermissions('host.rooms.update')
  deleteRoomRateOverride(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Param('rateOverrideId') rateOverrideId: number,
    @Query() query: Record<string, unknown>,
  ) {
    const propertyId = parseRequiredPropertyId(query);
    return CommandBus.execute(
      new DeleteHostRoomRateOverrideCommand(
        request.user,
        propertyId,
        Number(id),
        Number(rateOverrideId),
      ),
    );
  }
}
