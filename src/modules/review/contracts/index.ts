/**
 * Surface publique du module review.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ReviewModule Nest et ORM).
 */
export { ReviewOutput } from '@src/modules/review/applications/dto/review.output';
export { RoomRatingSummaryOutput } from '@src/modules/review/applications/dto/room-rating-summary.output';
export { ListRoomReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListRoomReviewsQuery';
export { GetRoomRatingSummaryQuery } from '@src/modules/review/applications/useCase/queries/GetRoomRatingSummaryQuery';
