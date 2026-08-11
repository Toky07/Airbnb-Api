import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListPendingReviewsQuery {
  constructor(public readonly pagination: PaginationParams) {}
}
