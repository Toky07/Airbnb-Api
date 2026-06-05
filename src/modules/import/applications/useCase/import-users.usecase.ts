import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '../../../user/application/useCase/createuser.usecase';
import { fetchImageFromUrl } from '../../../media/utils/fetch-image-from-url';
import type { ImportUserRowDto } from '../dto/import-batch.dto';
import type { ImportEntityResult } from '../dto/import-entity-result.dto';
import { emptyImportEntityResult } from '../dto/import-entity-result.dto';
import type { ImportBatchContext } from '../services/import-batch-context.service';
import { validateImportUserRow } from '../validation/validate-import-user-row';

@Injectable()
export class ImportUsersUseCase {
  constructor(private readonly createUser: CreateUserUseCase) {}

  async execute(
    rows: ImportUserRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]!;
      const validation = validateImportUserRow(row, index);
      if (!validation.ok) {
        result.errors.push({
          entity: 'user',
          index,
          field: validation.field,
          message: validation.message,
        });
        continue;
      }

      const emailKey = row.email.trim().toLowerCase();
      if (context.emailToUserId.has(emailKey)) {
        result.errors.push({
          entity: 'user',
          index,
          field: 'email',
          message: `L’e-mail ${row.email} existe déjà.`,
        });
        continue;
      }

      try {
        const avatarFile = row.avatarUrl
          ? await fetchImageFromUrl(row.avatarUrl)
          : null;
        const created = await this.createUser.execute(
          {
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            email: row.email.trim(),
            phoneNumber: row.phoneNumber.trim(),
            avatar: row.avatarUrl?.trim() ?? '',
          },
          avatarFile ?? undefined,
        );
        context.emailToUserId.set(emailKey, created.id);
        result.created += 1;
      } catch (cause) {
        result.errors.push({
          entity: 'user',
          index,
          message: cause instanceof Error ? cause.message : 'Création impossible.',
        });
      }
    }

    return result;
  }
}
