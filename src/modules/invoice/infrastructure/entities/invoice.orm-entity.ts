import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'invoices' })
@Unique(['paymentType', 'paymentId'])
export class InvoiceOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column()
  paymentType: string;

  @Column({ type: 'integer' })
  paymentId: number;

  @Column()
  path: string;

  @Column()
  invoiceNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
