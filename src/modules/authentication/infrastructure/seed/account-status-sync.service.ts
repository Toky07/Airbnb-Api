import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';

@Injectable()
export class AccountStatusSyncService implements OnModuleInit {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.syncAuthStatuses();
    await this.syncUserStatuses();
  }

  /**
   * N’écrit que les lignes dont le statut est vraiment incorrect.
   * Un UPDATE de masse ferait bouger `auth.updatedAt` à chaque reboot API,
   * et le AuthGuard considérerait alors tous les JWT comme révoqués.
   */
  private async syncAuthStatuses(): Promise<void> {
    await this.authRepository
      .createQueryBuilder()
      .update(AuthEntity)
      .set({ status: ACCOUNT_STATUS.PENDING })
      .where('password IS NULL')
      .andWhere('status != :disabled', { disabled: ACCOUNT_STATUS.DISABLED })
      .andWhere('status != :pending', { pending: ACCOUNT_STATUS.PENDING })
      .execute();

    await this.authRepository
      .createQueryBuilder()
      .update(AuthEntity)
      .set({ status: ACCOUNT_STATUS.ACTIVE })
      .where('password IS NOT NULL')
      .andWhere('status != :disabled', { disabled: ACCOUNT_STATUS.DISABLED })
      .andWhere('status != :active', { active: ACCOUNT_STATUS.ACTIVE })
      .execute();
  }

  private async syncUserStatuses(): Promise<void> {
    const users = await this.userRepository.find({
      relations: ['auth'],
    });

    for (const user of users) {
      const status =
        user.auth?.status === ACCOUNT_STATUS.ACTIVE && user.auth.password
          ? ACCOUNT_STATUS.ACTIVE
          : ACCOUNT_STATUS.PENDING;

      if (user.status !== status) {
        await this.userRepository.update(user.id, { status });
      }

      if (user.authId == null && user.auth?.id) {
        await this.userRepository.update(user.id, { authId: user.auth.id });
      }
    }
  }
}
