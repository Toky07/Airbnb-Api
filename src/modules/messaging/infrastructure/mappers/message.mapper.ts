import { Message } from '@src/modules/messaging/domain/entities/message.entity';
import { MessageOrmEntity } from '@src/modules/messaging/infrastructure/entities/message.orm-entity';

export class MessageMapper {
  static toDomain(entity: MessageOrmEntity): Message {
    return new Message(
      entity.conversationId,
      entity.senderId,
      entity.body,
      entity.id,
      entity.readAt,
      entity.createdAt,
    );
  }

  static toEntity(domain: Message): MessageOrmEntity {
    const entity = new MessageOrmEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.conversationId = domain.conversationId;
    entity.senderId = domain.senderId;
    entity.body = domain.body;
    entity.readAt = domain.readAt ?? null;
    return entity;
  }
}
