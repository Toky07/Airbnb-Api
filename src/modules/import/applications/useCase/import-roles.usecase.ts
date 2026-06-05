import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleUseCase } from '../../../authentication/useCase/create-role.usecase';
import { UpdateRoleUseCase } from '../../../authentication/useCase/update-role.usecase';
import { SetRolePermissionsUseCase } from '../../../authentication/useCase/set-role-permissions.usecase';
import { ROLE_REPOSITORY } from '../../../authentication/domain/repositories/role.repository';
import type { IRoleRepository } from '../../../authentication/domain/repositories/role.repository';
import { SUPERADMIN_ROLE_SLUG } from '../../../authentication/domain/constants/permissions.constant';
import type { ImportRoleRowDto } from '../dto/import-batch.dto';
import type { ImportEntityResult } from '../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../dto/import-entity-result.dto';
import { parseImportRolePermissionKeys } from '../validation/parse-import-role-permission-keys';
import { validateImportRoleRow } from '../validation/validate-import-role-row';

@Injectable()
export class ImportRolesUseCase {
  constructor(
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly setRolePermissions: SetRolePermissionsUseCase,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(rows: ImportRoleRowDto[] | undefined): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]!;
      const validation = validateImportRoleRow(row);
      if (!validation.ok) {
        result.errors.push({
          entity: 'role',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const slug = row.slug.trim();
      const permissionKeys = parseImportRolePermissionKeys(row.permissionKeys);
      const existing = await this.roleRepository.findBySlug(slug);

      try {
        if (slug === SUPERADMIN_ROLE_SLUG) {
          if (existing?.id) {
            if (row.description?.trim()) {
              await this.updateRole.execute({
                id: existing.id,
                description: row.description.trim(),
              });
            }
            result.created += 1;
          } else {
            result.errors.push({
              entity: 'role',
              index,
              field: 'slug',
              message: 'Le rôle super administrateur doit exister avant import.',
            });
          }
          continue;
        }

        if (existing?.id) {
          await this.updateRole.execute({
            id: existing.id,
            name: row.name.trim(),
            description: row.description?.trim() || null,
          });
          await this.setRolePermissions.execute(existing.id, permissionKeys);
          result.created += 1;
          continue;
        }

        const created = await this.createRole.execute({
          name: row.name.trim(),
          slug,
          description: row.description?.trim() || undefined,
        });
        await this.setRolePermissions.execute(created.id, permissionKeys);
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'role',
          index,
          message: cause instanceof Error ? cause.message : 'Import impossible.',
        });
      }
    }

    return result;
  }
}
