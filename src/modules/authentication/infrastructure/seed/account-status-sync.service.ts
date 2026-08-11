import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
    await this.authRepository.update(
      { password: IsNull() },
      { status: ACCOUNT_STATUS.PENDING },
    );

    await this.authRepository
      .createQueryBuilder()
      .update(AuthEntity)
      .set({ status: ACCOUNT_STATUS.ACTIVE })
      .where('password IS NOT NULL')
      .execute();

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
