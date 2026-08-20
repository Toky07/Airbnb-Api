import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { ACCOUNT_STATUS } from '@src/modules/authentication/contracts';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  avatar: string;

  @Column({ default: ACCOUNT_STATUS.PENDING })
  status: string;

  @Column({ type: 'integer', nullable: true })
  authId: number | null = null;

  @Column({ type: 'varchar', nullable: true })
  stripeAccountId: string | null = null;

  @Column({ type: 'varchar', default: 'not_started' })
  stripeOnboardingStatus: string;

  @Column({ type: 'boolean', default: false })
  stripeChargesEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  stripePayoutsEnabled: boolean;

  @ManyToOne(() => AuthEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authId' })
  auth?: AuthEntity | null;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
