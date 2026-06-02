import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'media' })
export class MediaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  type: string;

  @Column()
  entityType: string;

  @Column()
  entityId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
