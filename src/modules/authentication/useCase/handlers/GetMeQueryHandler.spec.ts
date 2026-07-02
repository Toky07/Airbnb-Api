import { describe, expect, it, vi } from 'vitest';
import { GetMeQueryHandler } from './GetMeQueryHandler';
import { GetMeQuery } from '../queries/GetMeQuery';
import { Auth } from '../../domain/entities/user.entity';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { User } from '../../../user/domain/entities/user.entity';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { HOST_ROLE_SLUG } from '../../domain/constants/permissions.constant';

describe('GetMeQueryHandler', () => {
  const hostRole = new RoleEntity(
    new UserNameVO('Hôte'),
    HOST_ROLE_SLUG,
    1,
    null,
    ['host.dashboard.read', 'host.property.read'],
  );

  const authRepository = {
    findById: vi.fn(async () =>
      new Auth(1, new EmailVO('host@test.com'), 'hash', [hostRole], 'active'),
    ),
  };

  const userRepository = {
    findByAuthId: vi.fn(async () =>
      new User(
        new UserNameVO('Jean'),
        new UserNameVO('Dupont'),
        new EmailVO('host@test.com'),
        new PhoneNumberVO('+33601020304'),
        'uploads/users/5/avatar.jpg',
        5,
      ),
    ),
  };

  const propertyRepository = {
    findAllByOwnerId: vi.fn(async () => [
      {
        id: 10,
        name: 'Hôtel Azur',
      },
    ]),
  };

  const ensurePropertyOwnerHostRole = {
    executeForAuthId: vi.fn(async () => false),
  };

  it('retourne le profil et hostAccess pour un hôte', async () => {
    const handler = new GetMeQueryHandler(
      authRepository as never,
      userRepository as never,
      propertyRepository as never,
      ensurePropertyOwnerHostRole as never,
    );

    const result = await handler.execute(new GetMeQuery(1));

    expect(result.profile).toEqual({
      userId: 5,
      firstName: 'Jean',
      lastName: 'Dupont',
      phoneNumber: '+33601020304',
      avatar: 'uploads/users/5/avatar.jpg',
    });
    expect(result.hostAccess).toEqual({
      isHost: true,
      hasProperty: true,
      propertyId: 10,
      propertyName: 'Hôtel Azur',
      propertyCount: 1,
    });
  });
});
