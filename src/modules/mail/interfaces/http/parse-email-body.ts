import { SendEmailDto } from '../../applications/dto/send-email.dto';

export function parseEmailBody(body: Record<string, unknown>): SendEmailDto {
  return {
    to: String(body.to ?? ''),
    cc: body.cc !== undefined ? String(body.cc) : undefined,
    bcc: body.bcc !== undefined ? String(body.bcc) : undefined,
    subject: String(body.subject ?? ''),
    body: String(body.body ?? ''),
    isHtml: body.isHtml === true || body.isHtml === 'true',
    sourceModule:
      body.sourceModule !== undefined ? String(body.sourceModule) : undefined,
  };
}
