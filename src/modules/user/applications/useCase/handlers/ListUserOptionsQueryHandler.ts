import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import type { ListUserOptionsQuery } from '@src/modules/user/applications/useCase/queries/ListUserOptionsQuery';

export class ListUserOptionsQueryHandler implements IQueryHandler<
  ListUserOptionsQuery,
  UserOutput[]
> {
  constructor(private readonly repository: IUserRepository) {}

  async execute(_query: ListUserOptionsQuery): Promise<UserOutput[]> {
    const users = await this.repository.findAll();
    return users.map((user) => UserOutput.fromDomain(user));
  }
}
