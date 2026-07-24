import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationModule } from '../reservation/reservation.module';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { RESERVATION_REPOSITORY } from '../reservation/domain/repositories/reservation.repository';
import type { IReservationRepository } from '../reservation/domain/repositories/reservation.repository';
import { ROOM_REPOSITORY } from '../rooms/domain/repositories/room.repository';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import { USER_REPOSITORY } from '../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import { REVIEW_REPOSITORY } from './domain/repositories/review.repository';
import type { IReviewRepository } from './domain/repositories/review.repository';
import { ReviewOrmEntity } from './infrastructure/entities/review.orm-entity';
import { ReviewRepository } from './infrastructure/repositories/review.repository';
import { ReviewController } from './interfaces/http/review.controller';
import { ReviewBootstrap } from './review.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreateReviewCommand } from './applications/useCase/commands/CreateReviewCommand';
import { ModerateReviewCommand } from './applications/useCase/commands/ModerateReviewCommand';
import { ListRoomReviewsQuery } from './applications/useCase/queries/ListRoomReviewsQuery';
import { ListMyReviewsQuery } from './applications/useCase/queries/ListMyReviewsQuery';
import { GetRoomRatingSummaryQuery } from './applications/useCase/queries/GetRoomRatingSummaryQuery';
import { ListPendingReviewsQuery } from './applications/useCase/queries/ListPendingReviewsQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity]),
    forwardRef(() => ReservationModule),
    forwardRef(() => RoomsModule),
    UserModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewRepository,
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewRepository,
    },
  ],
  exports: [REVIEW_REPOSITORY],
})
export class ReviewModule implements OnModuleInit {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  onModuleInit() {
    const bootstrap = ReviewBootstrap.create({
      reviewRepository: this.reviewRepository,
      reservationRepository: this.reservationRepository,
      userRepository: this.userRepository,
      roomRepository: this.roomRepository,
    });

    CommandBus.register(
      CreateReviewCommand,
      bootstrap.createReviewCommandHandler,
    );
    CommandBus.register(
      ModerateReviewCommand,
      bootstrap.moderateReviewCommandHandler,
    );
    QueryBus.register(
      ListRoomReviewsQuery,
      bootstrap.listRoomReviewsQueryHandler,
    );
    QueryBus.register(ListMyReviewsQuery, bootstrap.listMyReviewsQueryHandler);
    QueryBus.register(
      GetRoomRatingSummaryQuery,
      bootstrap.getRoomRatingSummaryQueryHandler,
    );
    QueryBus.register(
      ListPendingReviewsQuery,
      bootstrap.listPendingReviewsQueryHandler,
    );
  }
}
