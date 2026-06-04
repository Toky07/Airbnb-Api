import { Email } from '../../domain/entities/email.entity';
import type { EmailStatus } from '../../domain/constants/email-status.constant';
import { EmailOrmEntity } from '../entities/email.orm-entity';

export class EmailMapper {
  static toDomain(entity: EmailOrmEntity): Email {
    return new Email(
      entity.to ?? [],
      entity.subject,
      entity.body,
      entity.status as EmailStatus,
      entity.cc ?? [],
      entity.bcc ?? [],
      entity.isHtml,
      entity.sourceModule,
      entity.sentByAuthId,
      entity.errorMessage,
      entity.sentAt,
      entity.attachments ?? [],
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(email: Email): EmailOrmEntity {
    const entity = new EmailOrmEntity();
    if (email.id !== undefined) {
      entity.id = email.id;
    }
    entity.to = email.to;
    entity.cc = email.cc;
    entity.bcc = email.bcc;
    entity.subject = email.subject;
    entity.body = email.body;
    entity.isHtml = email.isHtml;
    entity.status = email.status;
    entity.errorMessage = email.errorMessage;
    entity.sentAt = email.sentAt;
    entity.sourceModule = email.sourceModule;
    entity.sentByAuthId = email.sentByAuthId;
    entity.attachments = email.attachments;
    return entity;
  }
}
