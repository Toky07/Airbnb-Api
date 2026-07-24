import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import type {
  CreateReviewDto,
  ModerateReviewDto,
} from '../../applications/dto/create-review.dto';
import { ReviewOutput } from '../../applications/dto/review.output';
import { CreateReviewCommand } from '../../applications/useCase/commands/CreateReviewCommand';
import { ModerateReviewCommand } from '../../applications/useCase/commands/ModerateReviewCommand';
import { ListMyReviewsQuery } from '../../applications/useCase/queries/ListMyReviewsQuery';
import { ListPendingReviewsQuery } from '../../applications/useCase/queries/ListPendingReviewsQuery';

@Controller('reviews')
export class ReviewController {
  @Post()
  create(
    @Req() request: { user?: JwtPayload },
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewOutput> {
    return CommandBus.execute(new CreateReviewCommand(request.user!.sub, dto));
  }

  @Get('me')
  listMine(
    @Req() request: { user?: JwtPayload },
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    return QueryBus.execute(
      new ListMyReviewsQuery(request.user!.sub, parsePaginationQuery(query)),
    );
  }

  @Get()
  @RequirePermissions('reviews.moderate')
  listPending(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    return QueryBus.execute(
      new ListPendingReviewsQuery(parsePaginationQuery(query)),
    );
  }

  @Patch(':id/moderate')
  @RequirePermissions('reviews.moderate')
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewOutput> {
    return CommandBus.execute(
      new ModerateReviewCommand(Number.parseInt(id, 10), dto),
    );
  }
}
