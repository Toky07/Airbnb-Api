import type { IReservationRepository } from '../reservation/domain/repositories/reservation.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import type { IReviewRepository } from './domain/repositories/review.repository';
import { ReviewEligibilityService } from './applications/services/review-eligibility.service';
import { CreateReviewCommandHandler } from './applications/useCase/handlers/CreateReviewCommandHandler';
import { ModerateReviewCommandHandler } from './applications/useCase/handlers/ModerateReviewCommandHandler';
import { ListRoomReviewsQueryHandler } from './applications/useCase/handlers/ListRoomReviewsQueryHandler';
import { ListMyReviewsQueryHandler } from './applications/useCase/handlers/ListMyReviewsQueryHandler';
import { GetRoomRatingSummaryQueryHandler } from './applications/useCase/handlers/GetRoomRatingSummaryQueryHandler';
import { ListPendingReviewsQueryHandler } from './applications/useCase/handlers/ListPendingReviewsQueryHandler';

export class ReviewBootstrap {
  static create(deps: {
    reviewRepository: IReviewRepository;
    reservationRepository: IReservationRepository;
    userRepository: IUserRepository;
    roomRepository: IRoomRepository;
  }) {
    const reviewEligibilityService = new ReviewEligibilityService(
      deps.reservationRepository,
      deps.reviewRepository,
      deps.userRepository,
    );

    return {
      createReviewCommandHandler: new CreateReviewCommandHandler(
        deps.reviewRepository,
        reviewEligibilityService,
      ),
      moderateReviewCommandHandler: new ModerateReviewCommandHandler(
        deps.reviewRepository,
        deps.userRepository,
      ),
      listRoomReviewsQueryHandler: new ListRoomReviewsQueryHandler(
        deps.reviewRepository,
        deps.roomRepository,
        deps.userRepository,
      ),
      listMyReviewsQueryHandler: new ListMyReviewsQueryHandler(
        deps.reviewRepository,
        deps.userRepository,
      ),
      getRoomRatingSummaryQueryHandler: new GetRoomRatingSummaryQueryHandler(
        deps.reviewRepository,
        deps.roomRepository,
      ),
      listPendingReviewsQueryHandler: new ListPendingReviewsQueryHandler(
        deps.reviewRepository,
        deps.userRepository,
      ),
    };
  }
}
