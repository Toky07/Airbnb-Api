import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListPendingReviewsQuery {
  constructor(public readonly pagination: PaginationParams) {}
}
