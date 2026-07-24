import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../domain/entities/conversation.entity';
import type { IConversationRepository } from '../../domain/repositories/conversation.repository';
import { ConversationOrmEntity } from '../entities/conversation.orm-entity';
import { ConversationMapper } from '../mappers/conversation.mapper';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly repository: Repository<ConversationOrmEntity>,
  ) {}

  async create(conversation: Conversation): Promise<Conversation> {
    const saved = await this.repository.save(
      this.repository.create(ConversationMapper.toEntity(conversation)),
    );
    return ConversationMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Conversation | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ConversationMapper.toDomain(entity) : null;
  }

  async findByReservationId(reservationId: number): Promise<Conversation | null> {
    if (!Number.isFinite(reservationId) || reservationId <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { reservationId } });
    return entity ? ConversationMapper.toDomain(entity) : null;
  }

  async findByParticipantUserId(userId: number): Promise<Conversation[]> {
    if (!Number.isFinite(userId) || userId <= 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: [{ guestId: userId }, { hostId: userId }],
      order: { lastMessageAt: 'DESC', updatedAt: 'DESC' },
    });

    return entities.map(ConversationMapper.toDomain);
  }

  async updateLastMessageAt(id: number, lastMessageAt: Date): Promise<void> {
    await this.repository.update(id, { lastMessageAt });
  }
}
