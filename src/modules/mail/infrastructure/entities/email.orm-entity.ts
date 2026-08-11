import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { EmailAttachment } from '@src/modules/mail/domain/entities/email-attachment.entity';

@Entity({ name: 'emails' })
export class EmailOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  to: string[];

  @Column({ type: 'simple-json', default: '[]' })
  cc: string[];

  @Column({ type: 'simple-json', default: '[]' })
  bcc: string[];

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  isHtml: boolean;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  sourceModule: string | null;

  @Column({ type: 'integer', nullable: true })
  sentByAuthId: number | null;

  @Column({ type: 'simple-json', default: '[]' })
  attachments: EmailAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
