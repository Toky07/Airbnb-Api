import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListRolesQuery {
  constructor(public readonly params: PaginationParams) {}
}
