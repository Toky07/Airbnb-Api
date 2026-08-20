import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListHostsQuery {
  constructor(public readonly params: PaginationParams) {}
}
