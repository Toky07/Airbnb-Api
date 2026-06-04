import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type IRoleRepository, ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import { SUPERADMIN_ROLE_SLUG } from '../domain/constants/permissions.constant';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    const role = await this.repository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.slug === SUPERADMIN_ROLE_SLUG) {
      throw new ForbiddenException('Le rôle super administrateur ne peut pas être supprimé');
    }

    return this.repository.delete(id);
  }
}
