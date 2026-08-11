import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreateUserCommand } from '@src/modules/user/contracts';
import { fetchImageFromUrl } from '@src/modules/media/contracts';
import type { ImportUserRowDto } from '@src/modules/import/applications/dto/import-batch.dto';
import type { ImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import { emptyImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';
import type { ImportBatchContext } from '@src/modules/import/applications/services/import-batch-context.service';
import { validateImportUserRow } from '@src/modules/import/applications/validation/validate-import-user-row';
import {
  pushImportRowError,
  pushImportValidationError,
  toImportErrorMessage,
} from '@src/modules/import/applications/utils/import-error.util';

export class ImportUsersHandler {
  async execute(
    rows: ImportUserRowDto[] | undefined,
    context: ImportBatchContext,
  ): Promise<ImportEntityResult> {
    if (!rows?.length) {
      return emptyImportEntityResult();
    }

    const result = emptyImportEntityResult();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const validation = validateImportUserRow(row, index);
      if (!validation.ok) {
        pushImportValidationError(result, 'user', index, validation);
        continue;
      }

      const emailKey = row.email.trim().toLowerCase();
      if (context.emailToUserId.has(emailKey)) {
        pushImportRowError(
          result,
          'user',
          index,
          `L’e-mail ${row.email} existe déjà.`,
          'email',
        );
        continue;
      }

      try {
        const avatarFile = row.avatarUrl
          ? await fetchImageFromUrl(row.avatarUrl)
          : null;
        const created = await CommandBus.execute<{ id: number }>(
          new CreateUserCommand(
            {
              firstName: row.firstName.trim(),
              lastName: row.lastName.trim(),
              email: row.email.trim(),
              phoneNumber: row.phoneNumber.trim(),
              avatar: row.avatarUrl?.trim() ?? '',
            },
            avatarFile ?? undefined,
          ),
        );
        context.emailToUserId.set(emailKey, created.id);
        result.created += 1;
      } catch (cause) {
        pushImportRowError(result, 'user', index, toImportErrorMessage(cause));
      }
    }

    return result;
  }
}
