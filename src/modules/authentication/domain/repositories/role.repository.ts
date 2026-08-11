import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';

export interface IRoleRepository {
  create(role: RoleEntity): Promise<RoleEntity>;
  update(role: RoleEntity): Promise<RoleEntity>;
  findAll(): Promise<RoleEntity[]>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
  findById(id: number): Promise<RoleEntity | null>;
  findBySlug(slug: string): Promise<RoleEntity | null>;
  delete(id: number): Promise<boolean>;
  setPermissions(roleId: number, permissionKeys: string[]): Promise<RoleEntity>;
}

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
