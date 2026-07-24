import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'invoice_sequences' })
export class InvoiceSequenceOrmEntity {
  @PrimaryColumn({ type: 'integer' })
  year: number;

  @Column({ type: 'integer', default: 0 })
  lastNumber: number;
}
