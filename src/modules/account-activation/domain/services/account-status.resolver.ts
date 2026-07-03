import type { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';
import {
  ACCOUNT_STATUS,
  type AccountStatus,
} from '../constants/account-status.constant';

export class AccountStatusResolver {
  /**
   * Un utilisateur est actif uniquement s'il existe dans `auth`
   * avec un mot de passe et un statut actif.
   */
  static resolve(user: {
    authId?: number | null;
    auth?: AuthEntity | null;
  }): AccountStatus {
    const auth = user.auth;

    if (!auth?.id) {
      return ACCOUNT_STATUS.PENDING;
    }

    if (auth.status === ACCOUNT_STATUS.ACTIVE && auth.password) {
      return ACCOUNT_STATUS.ACTIVE;
    }

    return ACCOUNT_STATUS.PENDING;
  }
}
