import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Message } from '@src/modules/messaging/domain/entities/message.entity';
import type { IMessageRepository } from '@src/modules/messaging/domain/repositories/message.repository';
import { MessageOrmEntity } from '@src/modules/messaging/infrastructure/entities/message.orm-entity';
import { MessageMapper } from '@src/modules/messaging/infrastructure/mappers/message.mapper';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repository: Repository<MessageOrmEntity>,
  ) {}

  async create(message: Message): Promise<Message> {
    const saved = await this.repository.save(
      this.repository.create(MessageMapper.toEntity(message)),
    );
    return MessageMapper.toDomain(saved);
  }

  async findByConversationId(
    conversationId: number,
    since?: Date,
  ): Promise<Message[]> {
    if (!Number.isFinite(conversationId) || conversationId <= 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: since
        ? {
            conversationId,
            createdAt: MoreThan(since),
          }
        : { conversationId },
      order: { createdAt: 'ASC' },
    });

    return entities.map(MessageMapper.toDomain);
  }

  async markAsRead(conversationId: number, readerId: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MessageOrmEntity)
      .set({ readAt: new Date() })
      .where('"conversationId" = :conversationId', { conversationId })
      .andWhere('"senderId" != :readerId', { readerId })
      .andWhere('"readAt" IS NULL')
      .execute();
  }
}
