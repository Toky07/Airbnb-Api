import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import type { ICartRepository } from '../../domain/repositories/cart.repository';
import { CartItemOrmEntity } from '../entities/cart-item.orm-entity';
import { CartOrmEntity } from '../entities/cart.orm-entity';
import { CartMapper } from '../mappers/cart.mapper';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly cartRepository: Repository<CartOrmEntity>,
    @InjectRepository(CartItemOrmEntity)
    private readonly itemRepository: Repository<CartItemOrmEntity>,
  ) {}

  async findById(id: number): Promise<Cart | null> {
    const entity = await this.cartRepository.findOne({
      where: { id: Number(id) },
      relations: ['items'],
    });
    return entity ? CartMapper.toDomain(entity) : null;
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    const entity = await this.cartRepository.findOne({
      where: { sessionId: sessionId.trim() },
      relations: ['items'],
    });
    return entity ? CartMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Cart | null> {
    const entity = await this.cartRepository.findOne({
      where: { userId: Number(userId) },
      relations: ['items'],
    });
    return entity ? CartMapper.toDomain(entity) : null;
  }

  async create(cart: Cart): Promise<Cart> {
    const saved = await this.cartRepository.save(
      this.cartRepository.create({
        sessionId: cart.sessionId || randomUUID(),
        userId: cart.userId,
      }),
    );
    return CartMapper.toDomain(saved);
  }

  async save(cart: Cart): Promise<Cart> {
    await this.cartRepository.update(Number(cart.id), {
      userId: cart.userId,
      sessionId: cart.sessionId,
    });
    const reloaded = await this.findById(cart.id!);
    return reloaded!;
  }

  async delete(id: number): Promise<void> {
    await this.cartRepository.delete(Number(id));
  }

  async findItemById(itemId: number): Promise<CartItem | null> {
    const entity = await this.itemRepository.findOne({
      where: { id: Number(itemId) },
    });
    return entity ? CartMapper.itemToDomain(entity) : null;
  }

  async addItem(cartId: number, item: CartItem): Promise<CartItem> {
    const entity = CartMapper.itemToEntity(item, cartId);
    const saved = await this.itemRepository.save(this.itemRepository.create(entity));
    return CartMapper.itemToDomain(saved);
  }

  async updateItem(item: CartItem): Promise<CartItem> {
    const saved = await this.itemRepository.save(CartMapper.itemToEntity(item, item.cartId));
    return CartMapper.itemToDomain(saved);
  }

  async removeItem(itemId: number): Promise<void> {
    await this.itemRepository.delete(Number(itemId));
  }

  async clearItems(cartId: number): Promise<void> {
    await this.itemRepository.delete({ cartId: Number(cartId) });
  }

  async moveItems(fromCartId: number, toCartId: number): Promise<void> {
    await this.itemRepository.update(
      { cartId: Number(fromCartId) },
      { cartId: Number(toCartId) },
    );
  }
}
