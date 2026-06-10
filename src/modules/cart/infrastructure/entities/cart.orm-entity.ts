import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItemOrmEntity } from './cart-item.orm-entity';

@Entity({ name: 'carts' })
export class CartOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sessionId: string;

  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  @OneToMany(() => CartItemOrmEntity, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItemOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
