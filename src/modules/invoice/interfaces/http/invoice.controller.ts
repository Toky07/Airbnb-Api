import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { ListMyInvoicesQuery } from '@src/modules/invoice/applications/useCase/queries/ListMyInvoicesQuery';
import { ListInvoicesQuery } from '@src/modules/invoice/applications/useCase/queries/ListInvoicesQuery';
import { DownloadInvoiceQuery } from '@src/modules/invoice/applications/useCase/queries/DownloadInvoiceQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';
import type { StreamableFile } from '@nestjs/common';

@ApiTags(SWAGGER_TAGS.INVOICES)
@ApiJwtAuth()
@Controller('invoices')
export class InvoiceController {
  @Get()
  @RequirePermissions('invoices.read')
  @ApiOperation({ summary: 'Liste des factures (admin)' })
  @ApiPaginationQuery()
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(new ListInvoicesQuery(parsePaginationQuery(query)));
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes factures (voyageur)' })
  listMine(@Req() request: { user?: JwtPayload }) {
    return QueryBus.execute(new ListMyInvoicesQuery(request.user!.sub));
  }

  @Get('me/:id/download')
  @ApiOperation({ summary: 'Télécharger une de mes factures (PDF)' })
  @ApiProduces('application/pdf')
  downloadMine(
    @Req() request: { user?: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    return QueryBus.execute(
      new DownloadInvoiceQuery(id, request.user!.sub, false),
    );
  }

  @Get(':id/download')
  @RequirePermissions('invoices.read')
  @ApiOperation({ summary: 'Télécharger une facture (admin, PDF)' })
  @ApiProduces('application/pdf')
  downloadAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    return QueryBus.execute(new DownloadInvoiceQuery(id, null, true));
  }
}
