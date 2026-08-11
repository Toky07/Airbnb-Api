import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListRoomReviewsQuery {
  constructor(
    public readonly slug: string,
    public readonly pagination: PaginationParams,
  ) {}
}
