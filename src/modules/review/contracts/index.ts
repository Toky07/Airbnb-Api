/**
 * Surface publique du module review.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ReviewModule Nest et ORM).
 */
export { ReviewOutput } from '../applications/dto/review.output';
export { RoomRatingSummaryOutput } from '../applications/dto/room-rating-summary.output';
export { ListRoomReviewsQuery } from '../applications/useCase/queries/ListRoomReviewsQuery';
export { GetRoomRatingSummaryQuery } from '../applications/useCase/queries/GetRoomRatingSummaryQuery';
