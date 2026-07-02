import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import type { ListUserOptionsQuery } from '../queries/ListUserOptionsQuery';

export class ListUserOptionsQueryHandler
  implements IQueryHandler<ListUserOptionsQuery, UserOutput[]>
{
  constructor(private readonly repository: IUserRepository) {}

  async execute(_query: ListUserOptionsQuery): Promise<UserOutput[]> {
    const users = await this.repository.findAll();
    return users.map((user) => UserOutput.fromDomain(user));
  }
}
