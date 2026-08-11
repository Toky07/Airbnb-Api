import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListUsersQuery {
  constructor(public readonly params: PaginationParams) {}
}
