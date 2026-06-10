import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reservations' })
export class ReservationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  roomId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ type: 'integer' })
  guestCount: number;

  @Column({ type: 'real' })
  totalPrice: number;

  @Column({ type: 'integer' })
  nights: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
