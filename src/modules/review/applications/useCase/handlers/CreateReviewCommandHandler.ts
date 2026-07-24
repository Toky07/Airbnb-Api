import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import { Review } from '../../../domain/entities/review.entity';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import { isValidRating } from '../../dto/create-review.dto';
import { ReviewOutput } from '../../dto/review.output';
import type { ReviewEligibilityService } from '../../services/review-eligibility.service';
import type { CreateReviewCommand } from '../commands/CreateReviewCommand';

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
