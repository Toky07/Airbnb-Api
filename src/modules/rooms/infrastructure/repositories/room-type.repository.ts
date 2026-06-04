import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from '../../domain/entities/room-type.entity';
import type { IRoomTypeRepository } from '../../domain/repositories/room-type.repository';
import { RoomTypeEntity } from '../entities/room-type.entity';
import { RoomTypeMapper } from '../mappers/room-type.mapper';

@Injectable()
export class RoomTypeRepository implements IRoomTypeRepository {
  constructor(
    @InjectRepository(RoomTypeEntity)
    private readonly repository: Repository<RoomTypeEntity>,
  ) {}

  async findAll(): Promise<RoomType[]> {
    const entities = await this.repository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map(RoomTypeMapper.toDomain);
  }

  async findActive(): Promise<RoomType[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map(RoomTypeMapper.toDomain);
  }

  async findById(id: number): Promise<RoomType | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RoomTypeMapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<RoomType | null> {
    const entity = await this.repository.findOne({ where: { slug } });
    return entity ? RoomTypeMapper.toDomain(entity) : null;
  }

  async create(type: RoomType): Promise<RoomType> {
    const saved = await this.repository.save(
      this.repository.create(RoomTypeMapper.toEntity(type)),
    );
    return RoomTypeMapper.toDomain(saved);
  }

  async update(type: RoomType): Promise<RoomType> {
    const data = await this.repository.preload({
      ...RoomTypeMapper.toEntity(type),
      id: type.id,
    });
    if (!data) {
      throw new Error('Room type not found');
    }
    const saved = await this.repository.save(data);
    return RoomTypeMapper.toDomain(saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async countUsages(id: number): Promise<number> {
    return this.repository.manager
      .createQueryBuilder()
      .from('rooms', 'room')
      .where('room.roomTypeId = :id', { id })
      .getCount();
  }
}
