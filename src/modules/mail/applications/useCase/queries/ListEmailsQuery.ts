import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListEmailsQuery {
  constructor(public readonly params: PaginationParams) {}
}
