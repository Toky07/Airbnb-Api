import { PropertyEntity } from '../entities/property-entity.entity';
import { IPropertyRepository } from '../../domain/repositories/property.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../domain/entities/property.entity';
import { PropertyMapper } from '../mappers/property.mapper';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';

export const PROPERTY_REPOSITORY = 'PROPERTY_REPOSITORY';

export class PropertyRepository implements IPropertyRepository {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly repository: Repository<PropertyEntity>,
  ) {}

  async findAll(): Promise<Property[]> {
    const properties = await this.repository.find({
      relations: ['rooms', 'propertyType'],
    });

    return properties.map((property) => PropertyMapper.toDomain(property));
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Property>> {
    const qb = this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.rooms', 'rooms')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .orderBy('property.name', 'ASC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(property.name LIKE :term OR property.city LIKE :term OR property.country LIKE :term OR property.address LIKE :term OR property.description LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => PropertyMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async findById(id: number): Promise<Property | null> {
    const property = await this.repository.findOne({
      where: { id },
      relations: ['rooms', 'propertyType'],
    });
    return property ? PropertyMapper.toDomain(property) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Property | null> {
    const properties = await this.findAllByOwnerId(ownerId);
    return properties[0] ?? null;
  }

  async findAllByOwnerId(ownerId: number): Promise<Property[]> {
    const properties = await this.repository.find({
      where: { ownerId: Number(ownerId) },
      relations: ['rooms', 'propertyType'],
      order: { name: 'ASC' },
    });
    return properties.map((property) => PropertyMapper.toDomain(property));
  }

  async findByIdForOwner(
    propertyId: number,
    ownerId: number,
  ): Promise<Property | null> {
    const property = await this.repository.findOne({
      where: { id: propertyId, ownerId: Number(ownerId) },
      relations: ['rooms', 'propertyType'],
    });
    return property ? PropertyMapper.toDomain(property) : null;
  }

  async create(property: Property): Promise<Property> {
    const data = this.repository.create(PropertyMapper.toEntity(property));
    const newProperty = await this.repository.save(data);
    const reloaded = await this.findById(newProperty.id);
    if (!reloaded) {
      throw new Error('Property not found after create');
    }
    return reloaded;
  }

  async update(property: Property): Promise<Property> {
    const data = await this.repository.preload({
      ...PropertyMapper.toEntity(property),
      id: +property.id!,
    });

    if (!data) {
      throw new Error('Property not found');
    }

    await this.repository.save(data);
    const reloaded = await this.findById(property.id!);
    if (!reloaded) {
      throw new Error('Property not found after update');
    }
    return reloaded;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
