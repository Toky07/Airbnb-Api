import type { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import {
  ACCOUNT_STATUS,
  type AccountStatus,
} from '@src/modules/authentication/domain/constants/account-status.constant';

export class AccountStatusResolver {
  /**
   * Statut affiché côté profil utilisateur, dérivé du compte auth lié.
   */
  static resolve(user: {
    authId?: number | null;
    auth?: AuthEntity | null;
    status?: AccountStatus | null;
  }): AccountStatus {
    const auth = user.auth;

    if (auth?.status === ACCOUNT_STATUS.DISABLED) {
      return ACCOUNT_STATUS.DISABLED;
    }

    if (user.status === ACCOUNT_STATUS.DISABLED) {
      return ACCOUNT_STATUS.DISABLED;
    }

    if (!auth?.id) {
      return user.status ?? ACCOUNT_STATUS.PENDING;
    }

    if (auth.status === ACCOUNT_STATUS.ACTIVE && auth.password) {
      return ACCOUNT_STATUS.ACTIVE;
    }

    return ACCOUNT_STATUS.PENDING;
  }
}
