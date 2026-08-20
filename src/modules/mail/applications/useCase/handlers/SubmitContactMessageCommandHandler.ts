import { ServiceUnavailableException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { SendEmailCommand } from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';
import { ContactMessageOutput } from '@src/modules/mail/applications/dto/contact-message.output';
import { getSupportEmail } from '@src/modules/mail/applications/services/get-support-email';
import type { SubmitContactMessageCommand } from '@src/modules/mail/applications/useCase/commands/SubmitContactMessageCommand';

export const CONTACT_MAIL_SOURCE = 'contact';

function escapePlain(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

export class SubmitContactMessageCommandHandler implements ICommandHandler<
  SubmitContactMessageCommand,
  ContactMessageOutput
> {
  async execute(
    command: SubmitContactMessageCommand,
  ): Promise<ContactMessageOutput> {
    const supportEmail = getSupportEmail();
    if (!supportEmail) {
      throw new ServiceUnavailableException(
        'Le formulaire de contact n’est pas configuré (SUPPORT_EMAIL).',
      );
    }

    const name = escapePlain(command.dto.name);
    const email = escapePlain(command.dto.email);
    const subject = escapePlain(command.dto.subject);
    const message = escapePlain(command.dto.message);

    await CommandBus.execute(
      new SendEmailCommand({
        to: supportEmail,
        subject: `[Contact] ${subject}`,
        body: [
          `Nom : ${name}`,
          `Email : ${email}`,
          `Sujet : ${subject}`,
          '',
          message,
        ].join('\n'),
        sourceModule: CONTACT_MAIL_SOURCE,
      }),
    );

    return new ContactMessageOutput(
      true,
      'Votre message a bien été envoyé. Nous vous répondrons par email.',
    );
  }
}
