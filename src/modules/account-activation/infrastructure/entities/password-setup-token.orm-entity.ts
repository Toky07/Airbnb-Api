import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';

@Entity({ name: 'password_setup_tokens' })
export class PasswordSetupTokenOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authId: number;

  @ManyToOne(() => AuthEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authId' })
  auth?: AuthEntity;

  @Column()
  tokenHash: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
