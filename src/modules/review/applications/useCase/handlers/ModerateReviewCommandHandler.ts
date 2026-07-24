import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import {
  REVIEW_STATUS,
  type ReviewStatus,
} from '../../../domain/constants/review-status.constant';
import { Review } from '../../../domain/entities/review.entity';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ReviewOutput } from '../../dto/review.output';
import type { ModerateReviewCommand } from '../commands/ModerateReviewCommand';

export class ModerateReviewCommandHandler implements ICommandHandler<
  ModerateReviewCommand,
  ReviewOutput
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ModerateReviewCommand): Promise<ReviewOutput> {
    const review = await this.reviewRepository.findById(command.reviewId);
    if (!review) {
      throw new NotFoundException('Avis introuvable.');
    }

    const nextStatus = command.dto.status;
    if (!this.isValidModerationStatus(nextStatus)) {
      throw new BadRequestException('Statut de modération invalide.');
    }

    if (review.status !== REVIEW_STATUS.PENDING) {
      throw new BadRequestException(
        'Seuls les avis en attente peuvent être modérés.',
      );
    }

    const updated = await this.reviewRepository.update(
      new Review(
        review.userId,
        review.reservationId,
        review.roomId,
        review.rating,
        review.comment,
        nextStatus,
        review.id,
        review.createdAt,
      ),
    );

    const author = await this.userRepository.findById(updated.userId);

    return ReviewOutput.fromDomain(updated, author?.name);
  }

  private isValidModerationStatus(
    status: string,
  ): status is Exclude<ReviewStatus, 'pending'> {
    return status === REVIEW_STATUS.PUBLISHED || status === REVIEW_STATUS.HIDDEN;
  }
}
