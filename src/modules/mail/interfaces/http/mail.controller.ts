import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { UploadFile } from '../../../media/types/upload-file';
import type { SendEmailDto } from '../../applications/dto/send-email.dto';
import { parseEmailBody } from './parse-email-body';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { SendEmailCommand } from '../../applications/useCase/commands/SendEmailCommand';
import { RetryEmailCommand } from '../../applications/useCase/commands/RetryEmailCommand';
import { GetEmailQuery } from '../../applications/useCase/queries/GetEmailQuery';
import { ListEmailsQuery } from '../../applications/useCase/queries/ListEmailsQuery';

const MAX_ATTACHMENTS = 5;

@Controller('emails')
export class MailController {
  @Get()
  @RequirePermissions('emails.read')
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(new ListEmailsQuery(parsePaginationQuery(query)));
  }

  @Get(':id')
  @RequirePermissions('emails.read')
  getById(@Param('id') id: number) {
    return QueryBus.execute(new GetEmailQuery(Number(id)));
  }

  @Post('send')
  @RequirePermissions('emails.send')
  @UseInterceptors(FilesInterceptor('attachments', MAX_ATTACHMENTS))
  send(
    @Req() request: { user?: JwtPayload },
    @Body() body: SendEmailDto | Record<string, unknown>,
    @UploadedFiles() attachments?: UploadFile[],
  ) {
    const dto =
      typeof (body as SendEmailDto).to === 'string'
        ? (body as SendEmailDto)
        : parseEmailBody(body as Record<string, unknown>);

    return CommandBus.execute(
      new SendEmailCommand({
        ...dto,
        sentByAuthId: request.user?.sub ?? null,
        files: attachments,
        sourceModule: dto.sourceModule ?? 'dashboard',
      }),
    );
  }

  @Post(':id/retry')
  @RequirePermissions('emails.send')
  retry(@Param('id') id: number) {
    return CommandBus.execute(new RetryEmailCommand(Number(id)));
  }
}
