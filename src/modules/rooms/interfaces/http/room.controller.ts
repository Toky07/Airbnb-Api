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
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { RoomOutput } from '../../applications/dto/room.output';
import type { CreateRoomDto } from '../../applications/dto/createRoom.dto';
import { parseKeptImages } from './parse-kept-images';
import { parseRoomBody } from './parse-room-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateRoomCommand } from '../../applications/useCase/commands/CreateRoomCommand';
import { UpdateRoomCommand } from '../../applications/useCase/commands/UpdateRoomCommand';
import { DeleteRoomCommand } from '../../applications/useCase/commands/DeleteRoomCommand';
import { FindRoomQuery } from '../../applications/useCase/queries/FindRoomQuery';
import { ListRoomsQuery } from '../../applications/useCase/queries/ListRoomsQuery';
import { GetRoomPricingPreviewQuery } from '../../applications/useCase/queries/GetRoomPricingPreviewQuery';
import { ListRoomReviewsQuery } from '../../../review/applications/useCase/queries/ListRoomReviewsQuery';
import { GetRoomRatingSummaryQuery } from '../../../review/applications/useCase/queries/GetRoomRatingSummaryQuery';
import { ReviewOutput } from '../../../review/applications/dto/review.output';
import { RoomRatingSummaryOutput } from '../../../review/applications/dto/room-rating-summary.output';

@Controller('rooms')
export class RoomController {
  @Public()
  @Get()
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<RoomOutput>> {
    return QueryBus.execute(new ListRoomsQuery(parsePaginationQuery(query)));
  }

  @Public()
  @Get('by-slug/:slug/reviews')
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
  async ratingSummaryBySlug(
    @Param('slug') slug: string,
  ): Promise<RoomRatingSummaryOutput> {
    return QueryBus.execute(new GetRoomRatingSummaryQuery(slug));
  }

  @Public()
  @Get('by-slug/:slug/pricing-preview')
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
  async findBySlug(@Param('slug') slug: string) {
    return QueryBus.execute(new FindRoomQuery({ slug }));
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: number) {
    return QueryBus.execute(new FindRoomQuery({ id: Number(id) }));
  }

  @Post()
  @RequirePermissions('rooms.create')
  @UseInterceptors(
    FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]),
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
  @UseInterceptors(
    FilesInterceptor('images', ENTITY_MEDIA_LIMITS[ENTITY_TYPE.ROOM]),
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
  async delete(@Param('id') id: number): Promise<{ status: boolean }> {
    const status = await CommandBus.execute<boolean>(
      new DeleteRoomCommand(Number(id)),
    );
    return { status };
  }
}
