import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { ACCOUNT_STATUS } from '../../domain/constants/account-status.constant';

@Entity({ name: 'auth' })
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ default: ACCOUNT_STATUS.PENDING })
  status: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'auth_roles',
  })
  roles?: Role[] | null;
}
