import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import type { FindUserQuery } from '../queries/FindUserQuery';

export class FindUserQueryHandler implements IQueryHandler<FindUserQuery, UserOutput> {
  constructor(private readonly repository: IUserRepository) {}

  async execute(query: FindUserQuery): Promise<UserOutput> {
    const user = await this.repository.findById(query.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(user);
  }
}
