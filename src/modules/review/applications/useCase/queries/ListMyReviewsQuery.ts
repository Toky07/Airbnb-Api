import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListMyReviewsQuery {
  constructor(
    public readonly authId: number,
    public readonly pagination: PaginationParams,
  ) {}
}
