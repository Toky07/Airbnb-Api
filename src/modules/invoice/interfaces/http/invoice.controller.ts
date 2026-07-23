import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  StreamableFile,
} from '@nestjs/common';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { ListMyInvoicesQuery } from '../../applications/useCase/queries/ListMyInvoicesQuery';
import { DownloadInvoiceQuery } from '../../applications/useCase/queries/DownloadInvoiceQuery';

@Controller('invoices')
export class InvoiceController {
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
