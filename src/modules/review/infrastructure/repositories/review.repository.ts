import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../../../../shared/pagination/pagination.types';
import { REVIEW_STATUS } from '../../domain/constants/review-status.constant';
import type { Review } from '../../domain/entities/review.entity';
import type {
  IReviewRepository,
  ReviewListParams,
  RoomRatingSummary,
} from '../../domain/repositories/review.repository';
import { ReviewOrmEntity } from '../entities/review.orm-entity';
import { ReviewMapper } from '../mappers/review.mapper';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
  ) {}

  async create(review: Review): Promise<Review> {
    const saved = await this.repository.save(
      this.repository.create(ReviewMapper.toEntity(review)),
    );
    return ReviewMapper.toDomain(saved);
  }

  async update(review: Review): Promise<Review> {
    const updated = await this.repository.preload(
      ReviewMapper.toEntity(review),
    );
    const saved = await this.repository.save(updated!);
    return ReviewMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Review | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async findByReservationId(reservationId: number): Promise<Review | null> {
    if (!Number.isFinite(reservationId) || reservationId <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { reservationId } });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async findPaginated(
    params: ReviewListParams,
  ): Promise<PaginatedResult<Review>> {
    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('review');

    if (params.roomId) {
      qb.andWhere('review.roomId = :roomId', { roomId: params.roomId });
    }

    if (params.userId) {
      qb.andWhere('review.userId = :userId', { userId: params.userId });
    }

    if (params.status) {
      qb.andWhere('review.status = :status', { status: params.status });
    }

    qb.orderBy('review.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      data: entities.map(ReviewMapper.toDomain),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getRoomRatingSummary(roomId: number): Promise<RoomRatingSummary> {
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const rows = await this.repository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.roomId = :roomId', { roomId })
      .andWhere('review.status = :status', { status: REVIEW_STATUS.PUBLISHED })
      .groupBy('review.rating')
      .getRawMany<{ rating: string; count: string }>();

    let totalReviews = 0;
    let ratingSum = 0;

    for (const row of rows) {
      const rating = Number.parseInt(row.rating, 10);
      const count = Number.parseInt(row.count, 10);
      distribution[rating] = count;
      totalReviews += count;
      ratingSum += rating * count;
    }

    return {
      averageRating:
        totalReviews === 0
          ? 0
          : Math.round((ratingSum / totalReviews) * 10) / 10,
      totalReviews,
      distribution,
    };
  }
}
