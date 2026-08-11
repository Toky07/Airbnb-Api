import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListHostRoomsQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly params: PaginationParams,
  ) {}
}
