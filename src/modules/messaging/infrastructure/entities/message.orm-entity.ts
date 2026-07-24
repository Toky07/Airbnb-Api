import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { ConversationOrmEntity } from './conversation.orm-entity';

@Entity({ name: 'messages' })
export class MessageOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index('IDX_messages_conversationId')
  conversationId!: number;

  @ManyToOne(
    () => ConversationOrmEntity,
    (conversation) => conversation.messages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'conversationId' })
  conversation!: ConversationOrmEntity;

  @Column()
  senderId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender!: UserEntity;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
