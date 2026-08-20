import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '@src/shared/pagination/pagination.types';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import type { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import type {
  HostApplicationListParams,
  IHostApplicationRepository,
} from '@src/modules/host-application/domain/repositories/host-application.repository';
import { HostApplicationOrmEntity } from '@src/modules/host-application/infrastructure/entities/host-application.orm-entity';
import { HostApplicationMapper } from '@src/modules/host-application/infrastructure/mappers/host-application.mapper';

@Injectable()
export class HostApplicationRepository implements IHostApplicationRepository {
  constructor(
    @InjectRepository(HostApplicationOrmEntity)
    private readonly repository: Repository<HostApplicationOrmEntity>,
  ) {}

  async create(application: HostApplication): Promise<HostApplication> {
    const saved = await this.repository.save(
      this.repository.create(HostApplicationMapper.toEntity(application)),
    );
    return HostApplicationMapper.toDomain(saved);
  }

  async update(application: HostApplication): Promise<HostApplication> {
    const updated = await this.repository.preload(
      HostApplicationMapper.toEntity(application),
    );
    const saved = await this.repository.save(updated!);
    return HostApplicationMapper.toDomain(saved);
  }

  async findById(id: number): Promise<HostApplication | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? HostApplicationMapper.toDomain(entity) : null;
  }

  async findLatestByUserId(userId: number): Promise<HostApplication | null> {
    if (!Number.isFinite(userId) || userId <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entity ? HostApplicationMapper.toDomain(entity) : null;
  }

  async findPendingByUserId(userId: number): Promise<HostApplication | null> {
    if (!Number.isFinite(userId) || userId <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({
      where: { userId, status: HOST_APPLICATION_STATUS.PENDING },
    });
    return entity ? HostApplicationMapper.toDomain(entity) : null;
  }

  async findPaginated(
    params: HostApplicationListParams,
  ): Promise<PaginatedResult<HostApplication>> {
    const page = params.page;
    const limit = params.limit;
    const qb = this.repository.createQueryBuilder('application');

    if (params.status) {
      qb.andWhere('application.status = :status', { status: params.status });
    }

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(application.city ILIKE :term OR application.propertyName ILIKE :term OR application.message ILIKE :term)',
        { term },
      );
    }

    qb.orderBy('application.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      data: entities.map(HostApplicationMapper.toDomain),
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
