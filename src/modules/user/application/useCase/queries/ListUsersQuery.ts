import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListUsersQuery {
  constructor(public readonly params: PaginationParams) {}
}
