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
import type { CreatePropertyDto } from '../../../properties/applications/dto/createProperty.dto';
import { parsePropertyBody } from '../../../properties/interfaces/http/parse-property-body';
import { parseRoomBody } from '../../../rooms/interfaces/http/parse-room-body';
import { parseKeptImages } from '../../../rooms/interfaces/http/parse-kept-images';
import type { CreateRoomDto } from '../../../rooms/applications/dto/createRoom.dto';
import { ENTITY_MEDIA_LIMITS, ENTITY_TYPE } from '../../../media/constant';
import type { UploadFile } from '../../../media/types/upload-file';
import { ListPropertyTypeOptionsUseCase } from '../../../properties/applications/useCase/list-property-type-options.usecase';
import { ListRoomTypeOptionsUseCase } from '../../../rooms/applications/useCase/list-room-type-options.usecase';
import { GetHostProfileUseCase } from '../../application/useCase/get-host-profile.usecase';
import {
  CreateHostPropertyUseCase,
  GetHostPropertyUseCase,
  UpdateHostPropertyUseCase,
} from '../../application/useCase/host-property.usecase';
import {
  CreateHostRoomUseCase,
  DeleteHostRoomUseCase,
  ListHostRoomsUseCase,
  UpdateHostRoomUseCase,
} from '../../application/useCase/host-rooms.usecase';

@Controller('host')
export class HostController {
  constructor(
    private readonly getHostProfileUseCase: GetHostProfileUseCase,
    private readonly getHostPropertyUseCase: GetHostPropertyUseCase,
    private readonly createHostPropertyUseCase: CreateHostPropertyUseCase,
    private readonly updateHostPropertyUseCase: UpdateHostPropertyUseCase,
    private readonly listHostRoomsUseCase: ListHostRoomsUseCase,
    private readonly createHostRoomUseCase: CreateHostRoomUseCase,
    private readonly updateHostRoomUseCase: UpdateHostRoomUseCase,
    private readonly deleteHostRoomUseCase: DeleteHostRoomUseCase,
    private readonly listPropertyTypeOptionsUseCase: ListPropertyTypeOptionsUseCase,
    private readonly listRoomTypeOptionsUseCase: ListRoomTypeOptionsUseCase,
  ) {}

  @Get('profile')
  @RequirePermissions('host.dashboard.read')
  profile(@Req() request: { user: JwtPayload }) {
    return this.getHostProfileUseCase.execute(request.user);
  }

  @Get('property')
  @RequirePermissions('host.property.read')
  property(@Req() request: { user: JwtPayload }) {
    return this.getHostPropertyUseCase.execute(request.user);
  }

  @Post('property')
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

  @Put('property')
  @RequirePermissions('host.property.update')
  @UseInterceptors(FileInterceptor('image'))
  updateProperty(
    @Req() request: { user: JwtPayload },
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ) {
    const dto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body as Record<string, unknown>);
    const { ownerId: _ownerId, ...fields } = dto;
    return this.updateHostPropertyUseCase.execute(request.user, fields, image);
  }

  @Get('rooms')
  @RequirePermissions('host.rooms.read')
  rooms(
    @Req() request: { user: JwtPayload },
    @Query() query: Record<string, unknown>,
  ) {
    return this.listHostRoomsUseCase.execute(
      request.user,
      parsePaginationQuery(query),
    );
  }

  @Post('rooms')
  @RequirePermissions('host.rooms.create')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  createRoom(
    @Req() request: { user: JwtPayload },
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const parsed =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(body as Record<string, unknown>);
    const { property: _property, ...fields } = parsed;
    return this.createHostRoomUseCase.execute(request.user, fields, images);
  }

  @Put('rooms/:id')
  @RequirePermissions('host.rooms.update')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  updateRoom(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const rawBody = body as Record<string, unknown>;
    const parsed =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(rawBody);
    const { property: _property, ...fields } = parsed;
    const keptImages = parseKeptImages(rawBody);
    return this.updateHostRoomUseCase.execute(
      request.user,
      id,
      fields,
      images,
      keptImages,
    );
  }

  @Delete('rooms/:id')
  @RequirePermissions('host.rooms.delete')
  deleteRoom(@Req() request: { user: JwtPayload }, @Param('id') id: number) {
    return this.deleteHostRoomUseCase.execute(request.user, id);
  }

  @Get('property-types/options')
  @RequirePermissions('host.property.read')
  propertyTypeOptions() {
    return this.listPropertyTypeOptionsUseCase.execute();
  }

  @Get('room-types/options')
  @RequirePermissions('host.rooms.read')
  roomTypeOptions() {
    return this.listRoomTypeOptionsUseCase.execute();
  }
}
