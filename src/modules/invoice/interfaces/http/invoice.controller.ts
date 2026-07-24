import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  StreamableFile,
} from '@nestjs/common';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { ListMyInvoicesQuery } from '../../applications/useCase/queries/ListMyInvoicesQuery';
import { ListInvoicesQuery } from '../../applications/useCase/queries/ListInvoicesQuery';
import { DownloadInvoiceQuery } from '../../applications/useCase/queries/DownloadInvoiceQuery';

@Controller('invoices')
export class InvoiceController {
  @Get()
  @RequirePermissions('invoices.read')
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(new ListInvoicesQuery(parsePaginationQuery(query)));
  }

  @Get('me')
  listMine(@Req() request: { user?: JwtPayload }) {
    return QueryBus.execute(new ListMyInvoicesQuery(request.user!.sub));
  }

  @Get('me/:id/download')
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
  downloadAdmin(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    return QueryBus.execute(new DownloadInvoiceQuery(id, null, true));
  }
}
