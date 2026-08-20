import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';
import { AccountStatusSyncService } from './account-status-sync.service';

function createQueryBuilder() {
  const execute = vi.fn().mockResolvedValue({ affected: 0 });
  const andWhere = vi.fn().mockReturnThis();
  const where = vi.fn().mockReturnThis();
  const set = vi.fn().mockReturnThis();
  const update = vi.fn().mockReturnThis();

  return {
    update,
    set,
    where,
    andWhere,
    execute,
  };
}

describe('AccountStatusSyncService', () => {
  it('ne met à jour que les comptes dont le statut doit vraiment changer', async () => {
    const pendingQb = createQueryBuilder();
    const activeQb = createQueryBuilder();
    const authRepository = {
      createQueryBuilder: vi
        .fn()
        .mockReturnValueOnce(pendingQb)
        .mockReturnValueOnce(activeQb),
    };
    const userRepository = {
      find: vi.fn().mockResolvedValue([]),
    };

    const service = new AccountStatusSyncService(
      authRepository as never,
      userRepository as never,
    );

    await service.onModuleInit();

    expect(pendingQb.where).toHaveBeenCalledWith('password IS NULL');
    expect(pendingQb.andWhere).toHaveBeenCalledWith('status != :disabled', {
      disabled: ACCOUNT_STATUS.DISABLED,
    });
    expect(pendingQb.andWhere).toHaveBeenCalledWith('status != :pending', {
      pending: ACCOUNT_STATUS.PENDING,
    });

    expect(activeQb.where).toHaveBeenCalledWith('password IS NOT NULL');
    expect(activeQb.andWhere).toHaveBeenCalledWith('status != :disabled', {
      disabled: ACCOUNT_STATUS.DISABLED,
    });
    expect(activeQb.andWhere).toHaveBeenCalledWith('status != :active', {
      active: ACCOUNT_STATUS.ACTIVE,
    });
  });
});
