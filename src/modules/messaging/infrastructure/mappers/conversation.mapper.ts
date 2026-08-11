import { Conversation } from '@src/modules/messaging/domain/entities/conversation.entity';
import { ConversationOrmEntity } from '@src/modules/messaging/infrastructure/entities/conversation.orm-entity';

export class ConversationMapper {
  static toDomain(entity: ConversationOrmEntity): Conversation {
    return new Conversation(
      entity.guestId,
      entity.hostId,
      entity.reservationId,
      entity.id,
      entity.lastMessageAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Conversation): ConversationOrmEntity {
    const entity = new ConversationOrmEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.guestId = domain.guestId;
    entity.hostId = domain.hostId;
    entity.reservationId = domain.reservationId;
    entity.lastMessageAt = domain.lastMessageAt ?? null;
    return entity;
  }
}
