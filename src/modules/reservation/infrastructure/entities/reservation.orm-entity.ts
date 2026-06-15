import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationItemOrmEntity } from './reservation-item.orm-entity';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { PaymentOrmEntity } from '../../../payment/infrastructure/entities/payment.orm-entity';

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

  @OneToOne(() => PaymentOrmEntity, (payment) => payment.reservation, {
    cascade: true,
  })
  @JoinColumn({ name: 'paymentId' })
  payment: PaymentOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
