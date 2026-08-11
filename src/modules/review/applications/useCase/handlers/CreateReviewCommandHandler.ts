import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import { Review } from '@src/modules/review/domain/entities/review.entity';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import { isValidRating } from '@src/modules/review/applications/dto/create-review.dto';
import { ReviewOutput } from '@src/modules/review/applications/dto/review.output';
import type { ReviewEligibilityService } from '@src/modules/review/applications/services/review-eligibility.service';
import type { CreateReviewCommand } from '@src/modules/review/applications/useCase/commands/CreateReviewCommand';

export class CreateReviewCommandHandler implements ICommandHandler<
  CreateReviewCommand,
  ReviewOutput
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly reviewEligibilityService: ReviewEligibilityService,
  ) {}

  async execute(command: CreateReviewCommand): Promise<ReviewOutput> {
    const { reservationId, rating, comment } = command.dto;

    if (!Number.isFinite(reservationId) || reservationId <= 0) {
      throw new BadRequestException('Réservation invalide.');
    }

    if (!isValidRating(rating)) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5.');
    }

    const trimmedComment = comment?.trim();
    if (!trimmedComment) {
      throw new BadRequestException('Le commentaire est requis.');
    }

    const { userId, roomId } =
      await this.reviewEligibilityService.assertCanReview(
        command.authId,
        reservationId,
      );

    const created = await this.reviewRepository.create(
      new Review(
        userId,
        reservationId,
        roomId,
        rating,
        trimmedComment,
        REVIEW_STATUS.PENDING,
      ),
    );

    return ReviewOutput.fromDomain(created);
  }
}
