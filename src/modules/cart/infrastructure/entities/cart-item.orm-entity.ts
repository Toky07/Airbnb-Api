import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CartOrmEntity } from './cart.orm-entity';

@Entity({ name: 'cart_items' })
export class CartItemOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemType: string;

  @Column()
  label: string;

  @Column({ type: 'real' })
  unitPrice: number;

  @Column({ type: 'real' })
  totalPrice: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'integer', nullable: true })
  propertyId: number | null;

  @Column({ type: 'integer', nullable: true })
  roomId: number | null;

  @Column({ type: 'integer', nullable: true })
  serviceId: number | null;

  @Column({ type: 'varchar', nullable: true })
  startDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  endDate: string | null;

  @Column({ type: 'integer', nullable: true })
  guestCount: number | null;

  @Column({ type: 'integer', nullable: true })
  nights: number | null;

  @Column({ type: 'integer' })
  cartId: number;

  @ManyToOne('CartOrmEntity', 'items', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartId' })
  cart: CartOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
