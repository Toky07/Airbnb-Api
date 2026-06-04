import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import { Email } from '../../domain/entities/email.entity';
import type { IEmailRepository } from '../../domain/repositories/email.repository';
import { EmailOrmEntity } from '../entities/email.orm-entity';
import { EmailMapper } from '../mappers/email.mapper';

@Injectable()
export class EmailRepository implements IEmailRepository {
  constructor(
    @InjectRepository(EmailOrmEntity)
    private readonly repository: Repository<EmailOrmEntity>,
  ) {}

  async create(email: Email): Promise<Email> {
    const saved = await this.repository.save(
      this.repository.create(EmailMapper.toEntity(email)),
    );
    return EmailMapper.toDomain(saved);
  }

  async update(email: Email): Promise<Email> {
    const saved = await this.repository.save(EmailMapper.toEntity(email));
    return EmailMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Email | null> {
    const entity = await this.repository.findOne({ where: { id: Number(id) } });
    return entity ? EmailMapper.toDomain(entity) : null;
  }

  async findPaginated(params: PaginationParams): Promise<PaginatedResult<Email>> {
    const qb = this.repository
      .createQueryBuilder('email')
      .orderBy('email.createdAt', 'DESC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(email.subject LIKE :term OR email.body LIKE :term OR email.status LIKE :term OR email.sourceModule LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => EmailMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }
}
