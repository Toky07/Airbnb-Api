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
import { GetEmailUseCase } from '../../applications/useCase/get-email.usecase';
import { ListEmailsUseCase } from '../../applications/useCase/list-emails.usecase';
import { RetryEmailUseCase } from '../../applications/useCase/retry-email.usecase';
import { SendEmailUseCase } from '../../applications/useCase/send-email.usecase';
import type { SendEmailDto } from '../../applications/dto/send-email.dto';
import { parseEmailBody } from './parse-email-body';

const MAX_ATTACHMENTS = 5;

@Controller('emails')
export class MailController {
  constructor(
    private readonly listEmailsUseCase: ListEmailsUseCase,
    private readonly getEmailUseCase: GetEmailUseCase,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly retryEmailUseCase: RetryEmailUseCase,
  ) {}

  @Get()
  @RequirePermissions('emails.read')
  list(@Query() query: Record<string, unknown>) {
    return this.listEmailsUseCase.execute(parsePaginationQuery(query));
  }

  @Get(':id')
  @RequirePermissions('emails.read')
  getById(@Param('id') id: number) {
    return this.getEmailUseCase.execute(Number(id));
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

    return this.sendEmailUseCase.execute({
      ...dto,
      sentByAuthId: request.user?.sub ?? null,
      files: attachments,
      sourceModule: dto.sourceModule ?? 'dashboard',
    });
  }

  @Post(':id/retry')
  @RequirePermissions('emails.send')
  retry(@Param('id') id: number) {
    return this.retryEmailUseCase.execute(Number(id));
  }
}
