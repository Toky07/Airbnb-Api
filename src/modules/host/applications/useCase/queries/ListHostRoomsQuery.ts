import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListHostRoomsQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly params: PaginationParams,
  ) {}
}
