import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationOrmEntity } from './reservation.orm-entity';

@Entity({ name: 'reservation_items' })
export class ReservationItemOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  reservationId: number;

  @ManyToOne(() => ReservationOrmEntity, (reservation) => reservation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservationId' })
  reservation: ReservationOrmEntity;

  @Column({ type: 'integer' })
  roomId: number;

  @Column()
  checkIn: string;

  @Column()
  checkOut: string;

  @Column({ type: 'integer' })
  guestCount: number;

  @Column({ type: 'real' })
  price: number;

  @Column({ type: 'integer' })
  nights: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
