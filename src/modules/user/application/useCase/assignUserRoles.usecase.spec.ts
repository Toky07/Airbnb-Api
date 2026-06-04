import { BadRequestException } from '@nestjs/common';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { AssignUserRolesUseCase } from './assignUserRoles.usecase';

const user = new User(
  new UserNameVO('Jean'),
  new UserNameVO('Dupont'),
  new EmailVO('jean@test.com'),
  new PhoneNumberVO('+33612345678'),
  '',
  1,
  new Date(),
  new Date(),
  null,
  [],
  false,
);

const userRepository = {
  findById: vi.fn().mockResolvedValue(user),
  linkAuthAccount: vi.fn().mockResolvedValue(undefined),
} as unknown as IUserRepository;

const authRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue(true),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

describe('AssignUserRolesUseCase', () => {
  it('requires password when no auth account exists', async () => {
    const useCase = new AssignUserRolesUseCase(userRepository, authRepository);

    await expect(useCase.execute(1, [2])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates auth, links user and assigns roles', async () => {
    vi.mocked(authRepository.findByEmail)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(new Auth(5, new EmailVO('jean@test.com'), 'hash', []));

    const useCase = new AssignUserRolesUseCase(userRepository, authRepository);
    const result = await useCase.execute(1, [2], 'secret-pass');

    expect(authRepository.create).toHaveBeenCalled();
    expect(userRepository.linkAuthAccount).toHaveBeenCalledWith(1, 5);
    expect(authRepository.assignRoles).toHaveBeenCalledWith(5, [2]);
    expect(result.email).toBe('jean@test.com');
  });
});
