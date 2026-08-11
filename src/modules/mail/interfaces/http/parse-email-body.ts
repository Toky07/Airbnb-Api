import {
  toOptionalScalarString,
  toScalarString,
} from '@src/shared/http/to-scalar-string';
import { SendEmailDto } from '@src/modules/mail/applications/dto/send-email.dto';

export function parseEmailBody(body: Record<string, unknown>): SendEmailDto {
  return {
    to: toScalarString(body.to),
    cc: toOptionalScalarString(body.cc),
    bcc: toOptionalScalarString(body.bcc),
    subject: toScalarString(body.subject),
    body: toScalarString(body.body),
    isHtml: body.isHtml === true || body.isHtml === 'true',
    sourceModule: toOptionalScalarString(body.sourceModule),
  };
}
