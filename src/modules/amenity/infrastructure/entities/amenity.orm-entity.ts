import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { AmenityScope } from '@src/modules/amenity/domain/constants/amenity-scope.constant';

@Entity({ name: 'amenities' })
@Unique(['name', 'scope'])
export class AmenityOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 80 })
  icon: string;

  @Column({ type: 'varchar', length: 20 })
  scope: AmenityScope;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
