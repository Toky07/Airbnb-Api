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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../../../shared/http/authenticated-request.type';
import { ApiJwtAuth, ApiPaginationQuery } from '../../../../shared/swagger/swagger.decorators';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import {
  CreateReviewDto,
  ModerateReviewDto,
} from '../../applications/dto/create-review.dto';
import { ReviewOutput } from '../../applications/dto/review.output';
import { CreateReviewCommand } from '../../applications/useCase/commands/CreateReviewCommand';
import { ModerateReviewCommand } from '../../applications/useCase/commands/ModerateReviewCommand';
import { ListMyReviewsQuery } from '../../applications/useCase/queries/ListMyReviewsQuery';
import { ListPendingReviewsQuery } from '../../applications/useCase/queries/ListPendingReviewsQuery';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.REVIEWS)
@ApiJwtAuth()
@Controller('reviews')
export class ReviewController {
  @Post()
  @ApiOperation({ summary: 'Soumettre un avis sur une réservation' })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewOutput> {
    return CommandBus.execute(new CreateReviewCommand(request.user.sub, dto));
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes avis' })
  @ApiPaginationQuery()
  listMine(
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    return QueryBus.execute(
      new ListMyReviewsQuery(request.user.sub, parsePaginationQuery(query)),
    );
  }

  @Get()
  @RequirePermissions('reviews.moderate')
  @ApiOperation({ summary: 'File de modération des avis en attente' })
  @ApiPaginationQuery()
  listPending(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    return QueryBus.execute(
      new ListPendingReviewsQuery(parsePaginationQuery(query)),
    );
  }

  @Patch(':id/moderate')
  @RequirePermissions('reviews.moderate')
  @ApiOperation({ summary: 'Approuver ou masquer un avis' })
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewOutput> {
    return CommandBus.execute(
      new ModerateReviewCommand(Number.parseInt(id, 10), dto),
    );
  }
}
