import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreateRoleCommand } from '@src/modules/authentication/contracts';
import { RoleOutput } from '@src/modules/authentication/contracts';
import { UpdateRoleCommand } from '@src/modules/authentication/contracts';
import { SetRolePermissionsCommand } from '@src/modules/authentication/contracts';
import type { IRoleRepository } from '@src/modules/authentication/contracts';
import {
  isPermissionLockedRoleSlug,
  isSystemRoleSlug,
} from '@src/modules/authentication/contracts';
import type { ImportRoleRowDto } from '@src/modules/import/applications/dto/import-batch.dto';
import type { ImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import { emptyImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import { parseImportRolePermissionKeys } from '@src/modules/import/applications/validation/parse-import-role-permission-keys';
import { validateImportRoleRow } from '@src/modules/import/applications/validation/validate-import-role-row';

export class ImportRolesHandler {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(
    rows: ImportRoleRowDto[] | undefined,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
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
        if (isSystemRoleSlug(slug)) {
          if (!existing?.id) {
            result.errors.push({
              entity: 'role',
              index,
              field: 'slug',
              message:
                'Les rôles système doivent être créés par le seed avant import.',
            });
            continue;
          }

          if (!isPermissionLockedRoleSlug(slug)) {
            await CommandBus.execute(
              new SetRolePermissionsCommand(existing.id, permissionKeys),
            );
          }

          result.created += 1;
          continue;
        }

        if (existing?.id) {
          await CommandBus.execute(
            new UpdateRoleCommand({
              id: existing.id,
              name: row.name.trim(),
              description: row.description?.trim() || null,
            }),
          );
          await CommandBus.execute(
            new SetRolePermissionsCommand(existing.id, permissionKeys),
          );
          result.created += 1;
          continue;
        }

        const created = await CommandBus.execute<RoleOutput>(
          new CreateRoleCommand({
            name: row.name.trim(),
            slug,
            description: row.description?.trim() || undefined,
          }),
        );
        await CommandBus.execute(
          new SetRolePermissionsCommand(created.id, permissionKeys),
        );
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'role',
          index,
          message:
            cause instanceof Error ? cause.message : 'Import impossible.',
        });
      }
    }

    return result;
  }
}
