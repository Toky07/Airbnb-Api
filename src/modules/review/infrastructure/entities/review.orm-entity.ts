import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { REVIEW_STATUS } from '../../domain/constants/review-status.constant';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';

@Entity({ name: 'reviews' })
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  reservationId: number;

  @Column({ type: 'integer' })
  roomId: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ enum: REVIEW_STATUS, default: REVIEW_STATUS.PENDING })
  status: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ReservationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation: ReservationOrmEntity;

  @ManyToOne(() => RoomEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @CreateDateColumn()
  createdAt: Date;
}
