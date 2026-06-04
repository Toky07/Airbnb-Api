import { describe, expect, it, vi } from 'vitest';
import { UpdateMyProfileUseCase } from './update-my-profile.usecase';
import { User } from '../../domain/entities/user.entity';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';

describe('UpdateMyProfileUseCase', () => {
  it('met à jour le profil de l’utilisateur connecté', async () => {
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('host@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const repository = {
      findByAuthId: vi.fn(async () => user),
      update: vi.fn(async (updated: User) => updated),
    };

    const saveUserAvatar = {
      resolve: vi.fn(async () => 'uploads/users/5/new.jpg'),
    };

    const useCase = new UpdateMyProfileUseCase(
      repository as never,
      saveUserAvatar as never,
    );

    const result = await useCase.execute(
      1,
      {
        firstName: 'Jean',
        lastName: 'Martin',
        phoneNumber: '+33601020305',
      },
      undefined,
    );

    expect(result.lastName).toBe('Martin');
    expect(result.phoneNumber).toBe('+33601020305');
  });
});
