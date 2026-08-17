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
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { UploadFile } from '@src/modules/media/contracts';
import { getAttachmentMulterOptions } from '@src/modules/media/contracts';
import type { SendEmailDto } from '@src/modules/mail/applications/dto/send-email.dto';
import { parseEmailBody } from './parse-email-body';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { SendEmailCommand } from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';
import { RetryEmailCommand } from '@src/modules/mail/applications/useCase/commands/RetryEmailCommand';
import { GetEmailQuery } from '@src/modules/mail/applications/useCase/queries/GetEmailQuery';
import { ListEmailsQuery } from '@src/modules/mail/applications/useCase/queries/ListEmailsQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

const MAX_ATTACHMENTS = 5;

@ApiTags(SWAGGER_TAGS.EMAILS)
@ApiJwtAuth()
@Controller('emails')
export class MailController {
  @Get()
  @RequirePermissions('emails.read')
  @ApiOperation({ summary: "Liste des emails (file d'envoi)" })
  @ApiPaginationQuery()
  list(@Query() query: Record<string, unknown>) {
    return QueryBus.execute(new ListEmailsQuery(parsePaginationQuery(query)));
  }

  @Get(':id')
  @RequirePermissions('emails.read')
  @ApiOperation({ summary: "Détail d'un email" })
  getById(@Param('id') id: number) {
    return QueryBus.execute(new GetEmailQuery(Number(id)));
  }

  @Post('send')
  @RequirePermissions('emails.send')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Envoyer un email manuellement' })
  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      MAX_ATTACHMENTS,
      getAttachmentMulterOptions(),
    ),
  )
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
  @ApiOperation({ summary: 'Relancer un email en échec' })
  retry(@Param('id') id: number) {
    return CommandBus.execute(new RetryEmailCommand(Number(id)));
  }
}
