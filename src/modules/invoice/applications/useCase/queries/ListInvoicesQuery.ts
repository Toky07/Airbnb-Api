import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListInvoicesQuery {
  constructor(public readonly params: PaginationParams) {}
}
