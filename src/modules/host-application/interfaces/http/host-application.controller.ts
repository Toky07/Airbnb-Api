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
import type { AuthenticatedRequest } from '@src/shared/http/authenticated-request.type';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { isHostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { CreateHostApplicationDto } from '@src/modules/host-application/applications/dto/create-host-application.dto';
import { ReviewHostApplicationDto } from '@src/modules/host-application/applications/dto/review-host-application.dto';
import { HostApplicationOutput } from '@src/modules/host-application/applications/dto/host-application.output';
import { SubmitHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/SubmitHostApplicationCommand';
import { ReviewHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/ReviewHostApplicationCommand';
import { GetMyHostApplicationQuery } from '@src/modules/host-application/applications/useCase/queries/GetMyHostApplicationQuery';
import { ListHostApplicationsQuery } from '@src/modules/host-application/applications/useCase/queries/ListHostApplicationsQuery';
import { ListHostsQuery } from '@src/modules/host-application/applications/useCase/queries/ListHostsQuery';
import { UserOutput } from '@src/modules/user/contracts';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.HOST_APPLICATIONS)
@ApiJwtAuth()
@Controller('host-applications')
export class HostApplicationController {
  @Get('me')
  @ApiOperation({ summary: 'Dernière demande pour devenir hôte' })
  me(
    @Req() request: AuthenticatedRequest,
  ): Promise<HostApplicationOutput | null> {
    return QueryBus.execute(new GetMyHostApplicationQuery(request.user.sub));
  }

  @Get('hosts')
  @RequirePermissions('hosts.read')
  @ApiPaginationQuery()
  @ApiOperation({ summary: 'Liste des utilisateurs avec le rôle hôte' })
  listHosts(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<UserOutput>> {
    return QueryBus.execute(new ListHostsQuery(parsePaginationQuery(query)));
  }

  @Get()
  @RequirePermissions('hosts.read')
  @ApiPaginationQuery()
  @ApiOperation({ summary: 'Liste des candidatures hôte' })
  list(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<HostApplicationOutput>> {
    const status = isHostApplicationStatus(query.status)
      ? query.status
      : undefined;
    return QueryBus.execute(
      new ListHostApplicationsQuery(parsePaginationQuery(query), status),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Déposer une demande pour devenir hôte' })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateHostApplicationDto,
  ): Promise<HostApplicationOutput> {
    return CommandBus.execute(
      new SubmitHostApplicationCommand(request.user.sub, dto),
    );
  }

  @Patch(':id/review')
  @RequirePermissions('hosts.moderate')
  @ApiOperation({ summary: 'Approuver ou refuser une candidature hôte' })
  review(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReviewHostApplicationDto,
  ): Promise<HostApplicationOutput> {
    return CommandBus.execute(
      new ReviewHostApplicationCommand(
        Number.parseInt(id, 10),
        request.user.sub,
        dto,
      ),
    );
  }
}
