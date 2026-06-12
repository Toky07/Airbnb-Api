import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationItemOrmEntity } from './reservation-item.orm-entity';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';

@Entity({ name: 'reservations' })
export class ReservationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @OneToMany(() => ReservationItemOrmEntity, (item) => item.reservation, {
    cascade: true,
  })
  items: ReservationItemOrmEntity[];

  @Column({ enum: RESERVATION_STATUS, default: RESERVATION_STATUS.PENDING })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
