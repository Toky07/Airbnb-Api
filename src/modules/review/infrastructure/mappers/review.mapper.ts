import type { ReviewStatus } from '@src/modules/review/domain/constants/review-status.constant';
import { Review } from '@src/modules/review/domain/entities/review.entity';
import { ReviewOrmEntity } from '@src/modules/review/infrastructure/entities/review.orm-entity';

export class ReviewMapper {
  static toDomain(entity: ReviewOrmEntity): Review {
    return new Review(
      entity.userId,
      entity.reservationId,
      entity.roomId,
      entity.rating,
      entity.comment,
      entity.status as ReviewStatus,
      entity.id,
      entity.createdAt,
    );
  }

  static toEntity(review: Review): ReviewOrmEntity {
    const entity = new ReviewOrmEntity();
    if (review.id) {
      entity.id = review.id;
    }
    entity.userId = review.userId;
    entity.reservationId = review.reservationId;
    entity.roomId = review.roomId;
    entity.rating = review.rating;
    entity.comment = review.comment;
    entity.status = review.status;
    return entity;
  }
}
