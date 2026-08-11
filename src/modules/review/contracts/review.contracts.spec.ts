import { describe, expect, it } from 'vitest';
import {
  GetRoomRatingSummaryQuery,
  ListRoomReviewsQuery,
  ReviewOutput,
  RoomRatingSummaryOutput,
} from './index';

describe('review/contracts', () => {
  it('expose DTOs et queries publics pour rooms', () => {
    expect(ReviewOutput).toBeTypeOf('function');
    expect(RoomRatingSummaryOutput).toBeTypeOf('function');
    expect(
      new ListRoomReviewsQuery('suite', { page: 1, limit: 10 }),
    ).toBeInstanceOf(ListRoomReviewsQuery);
    expect(new GetRoomRatingSummaryQuery('suite')).toBeInstanceOf(
      GetRoomRatingSummaryQuery,
    );
  });
});
