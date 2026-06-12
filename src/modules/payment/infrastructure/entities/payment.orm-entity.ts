import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PAYMENT_TYPE, type PaymentType } from '../../domain/types/payment.type';
import { ReservationOrmEntity } from 'src/modules/reservation/infrastructure/entities/reservation.orm-entity';

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
  cartId: number | null;

  @Column({ type: 'simple-json', default: '[]' })
  reservationIds: number[];

  @Column({ type: 'integer' })
  userId: number;

  @Column()
  propertyType: string;

  @Column({ type: 'integer' })
  propertyId: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'datetime', nullable: true })
  invoiceNotificationsSentAt: Date | null;

  @OneToOne(() => ReservationOrmEntity, (reservation) => reservation.payment)
  reservation: ReservationOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
