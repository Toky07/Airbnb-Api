import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListEmailsQuery {
  constructor(public readonly params: PaginationParams) {}
}
