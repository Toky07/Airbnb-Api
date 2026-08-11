import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetTokenOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authId: number;

  @ManyToOne(() => AuthEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authId' })
  auth?: AuthEntity;

  @Column()
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
