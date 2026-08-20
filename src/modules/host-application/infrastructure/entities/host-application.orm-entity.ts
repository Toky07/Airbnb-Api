import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';

@Entity({ name: 'host_applications' })
export class HostApplicationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar', length: 120 })
  city: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  propertyName: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: HOST_APPLICATION_STATUS.PENDING,
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  reviewComment: string | null;

  @Column({ type: 'integer', nullable: true })
  reviewedByAuthId: number | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
