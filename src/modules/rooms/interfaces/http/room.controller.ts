import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ENTITY_MEDIA_LIMITS, ENTITY_TYPE } from '../../../media/constant';
import { ListRoomsUseCase } from '../../applications/useCase/listRoom.usecase';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { RoomOutput } from '../../applications/dto/room.output';
import { FindOneRoomUseCase } from '../../applications/useCase/findOneRoom.usecase';
import type { CreateRoomDto } from '../../applications/dto/createRoom.dto';
import { CreateRoomUseCase } from '../../applications/useCase/createRoom.usecase';
import { UpdateRoomUseCase } from '../../applications/useCase/updateRoom.usecase';
import { DeleteRoomUseCase } from '../../applications/useCase/deleteRoom.usecase';
import { parseKeptImages } from './parse-kept-images';
import { parseRoomBody } from './parse-room-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly listRoomUseCase: ListRoomsUseCase,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
  ) {}

  @Public()
  @Get()
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<RoomOutput>> {
    return this.listRoomUseCase.execute(parsePaginationQuery(query));
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.findOneRoomUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('rooms.create')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  async create(
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const createRoomDto =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(body as Record<string, unknown>);
    return this.createRoomUseCase.execute(createRoomDto, images);
  }

  @Put(':id')
  @RequirePermissions('rooms.update')
  @UseInterceptors(FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]))
  async update(
    @Param('id') id: number,
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const rawBody = body as Record<string, unknown>;
    const updateRoomDto =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(rawBody);
    const keptImages = parseKeptImages(rawBody);
    return this.updateRoomUseCase.execute(id, updateRoomDto, images, keptImages);
  }

  @Delete(':id')
  @RequirePermissions('rooms.delete')
  async delete(@Param('id') id: number): Promise<{ status: boolean }> {
    const status = await this.deleteRoomUseCase.execute(id);
    return { status };
  }
}
