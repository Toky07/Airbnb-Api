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
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ENTITY_MEDIA_LIMITS,
  ENTITY_TYPE,
  getImageMulterOptions,
} from '@src/modules/media/contracts';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import type { CreateRoomDto } from '@src/modules/rooms/applications/dto/createRoom.dto';
import { parseKeptImages } from './parse-kept-images';
import { parseRoomBody } from './parse-room-body';
import type { UploadFile } from '@src/modules/media/contracts';
import {
  hasPermission,
  Public,
  RequirePermissions,
  type JwtPayload,
} from '@src/modules/authentication/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomCommand';
import { UpdateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomCommand';
import { DeleteRoomCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomCommand';
import { FindRoomQuery } from '@src/modules/rooms/applications/useCase/queries/FindRoomQuery';
import { ListRoomsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomsQuery';
import { GetRoomPricingPreviewQuery } from '@src/modules/rooms/applications/useCase/queries/GetRoomPricingPreviewQuery';
import {
  GetRoomRatingSummaryQuery,
  ListRoomReviewsQuery,
  ReviewOutput,
  RoomRatingSummaryOutput,
} from '@src/modules/review/contracts';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.ROOMS)
@Controller('rooms')
export class RoomController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Recherche et liste des chambres (public)' })
  @ApiPaginationQuery()
  async findAll(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<RoomOutput>> {
    const publicCatalog = !canManageRooms(request.user);
    return QueryBus.execute(
      new ListRoomsQuery(parsePaginationQuery(query), publicCatalog),
    );
  }

  @Public()
  @Get('by-slug/:slug/reviews')
  @ApiOperation({ summary: "Avis d'une chambre par slug" })
  @ApiPaginationQuery()
  async reviewsBySlug(
    @Param('slug') slug: string,
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    return QueryBus.execute(
      new ListRoomReviewsQuery(slug, parsePaginationQuery(query)),
    );
  }

  @Public()
  @Get('by-slug/:slug/rating-summary')
  @ApiOperation({ summary: "Résumé des notes d'une chambre" })
  async ratingSummaryBySlug(
    @Param('slug') slug: string,
  ): Promise<RoomRatingSummaryOutput> {
    return QueryBus.execute(new GetRoomRatingSummaryQuery(slug));
  }

  @Public()
  @Get('by-slug/:slug/pricing-preview')
  @ApiOperation({ summary: 'Aperçu tarifaire pour des dates' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-09-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-09-05' })
  @ApiQuery({ name: 'guestCount', required: true, example: 2 })
  async pricingPreviewBySlug(
    @Param('slug') slug: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('guestCount') guestCount: string,
  ) {
    return QueryBus.execute(
      new GetRoomPricingPreviewQuery(
        startDate,
        endDate,
        Number.parseInt(guestCount, 10),
        slug,
      ),
    );
  }

  @Public()
  @Get('by-slug/:slug')
  @ApiOperation({ summary: "Détail d'une chambre par slug" })
  async findBySlug(
    @Req() request: { user?: JwtPayload },
    @Param('slug') slug: string,
  ) {
    return QueryBus.execute(
      new FindRoomQuery({ slug }, !canManageRooms(request.user)),
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: "Détail d'une chambre par ID" })
  async findById(
    @Req() request: { user?: JwtPayload },
    @Param('id') id: number,
  ) {
    return QueryBus.execute(
      new FindRoomQuery({ id: Number(id) }, !canManageRooms(request.user)),
    );
  }

  @Post()
  @RequirePermissions('rooms.create')
  @ApiJwtAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer une chambre (admin)' })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM],
      getImageMulterOptions(),
    ),
  )
  async create(
    @Body() body: CreateRoomDto | Record<string, unknown>,
    @UploadedFiles() images?: UploadFile[],
  ) {
    const createRoomDto =
      typeof (body as CreateRoomDto).pricePerNight === 'number'
        ? (body as CreateRoomDto)
        : parseRoomBody(body);
    return CommandBus.execute(new CreateRoomCommand(createRoomDto, images));
  }

  @Put(':id')
  @RequirePermissions('rooms.update')
  @ApiJwtAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Modifier une chambre (admin)' })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM],
      getImageMulterOptions(),
    ),
  )
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
    return CommandBus.execute(
      new UpdateRoomCommand(Number(id), updateRoomDto, images, keptImages),
    );
  }

  @Delete(':id')
  @RequirePermissions('rooms.delete')
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Supprimer une chambre (admin)' })
  async delete(@Param('id') id: number): Promise<{ status: boolean }> {
    const status = await CommandBus.execute<boolean>(
      new DeleteRoomCommand(Number(id)),
    );
    return { status };
  }
}

function canManageRooms(user?: JwtPayload): boolean {
  return Boolean(user && hasPermission(user, ['rooms.read']));
}
