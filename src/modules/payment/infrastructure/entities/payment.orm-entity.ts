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
  cartId: number | null;

  @Column({ type: 'integer' })
  userId: number;

  @Column()
  propertyType: string;

  @Column({ type: 'integer' })
  propertyId: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invoiceNotificationsSentAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  refundedAmount: number;

  @Column({ type: 'varchar', nullable: true })
  refundTransactionId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
