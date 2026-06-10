import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'payments' })
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ default: 'eur' })
  currency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 'stripe' })
  provider: string;

  @Column({ unique: true })
  transactionId: string;

  @Column({ type: 'integer', nullable: true })
  reservationId: number | null;

  @Column({ type: 'integer', nullable: true })
  cartId: number | null;

  @Column({ type: 'simple-json', default: '[]' })
  reservationIds: number[];

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  roomId: number;

  @Column()
  checkInDate: string;

  @Column()
  checkOutDate: string;

  @Column({ type: 'integer' })
  guestCount: number;

  @Column({ type: 'integer' })
  nights: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
