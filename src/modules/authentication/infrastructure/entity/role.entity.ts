import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthEntity } from './auth.entity';
import { PermissionEntity } from './permission.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToMany(() => AuthEntity, (auth) => auth.roles)
  auths?: AuthEntity[] | null;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({ name: 'role_permissions' })
  permissions?: PermissionEntity[];
}
