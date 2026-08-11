import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { MessageOrmEntity } from './message.orm-entity';

@Entity({ name: 'conversations' })
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index('IDX_conversations_guestId')
  guestId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guestId' })
  guest!: UserEntity;

  @Column()
  @Index('IDX_conversations_hostId')
  hostId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hostId' })
  host!: UserEntity;

  @Column()
  @Index('IDX_conversations_reservationId', { unique: true })
  reservationId!: number;

  @ManyToOne(() => ReservationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation!: ReservationOrmEntity;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt!: Date | null;

  @OneToMany(() => MessageOrmEntity, (message) => message.conversation)
  messages!: MessageOrmEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
