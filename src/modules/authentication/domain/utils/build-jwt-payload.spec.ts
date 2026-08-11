import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { Auth } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserNameVO } from '../../../user/contracts';
import { buildJwtPayload, hasPermission } from './build-jwt-payload';

describe('buildJwtPayload', () => {
  it('marks superadmin and grants all permission checks', () => {
    const auth = new Auth(1, new EmailVO('admin@test.com'), 'hash', [
      new RoleEntity(
        new UserNameVO('Super administrateur'),
        'superadmin',
        1,
        null,
        ['users.read'],
      ),
    ]);

    const payload = buildJwtPayload(auth);
    expect(payload.isSuperAdmin).toBe(true);
    expect(hasPermission(payload, 'properties.delete')).toBe(true);
  });

  it('collects permissions from all roles', () => {
    const auth = new Auth(2, new EmailVO('editor@test.com'), 'hash', [
      new RoleEntity(new UserNameVO('Editor'), 'editor', 2, null, [
        'users.read',
      ]),
      new RoleEntity(new UserNameVO('Rooms'), 'rooms-only', 3, null, [
        'rooms.read',
      ]),
    ]);

    const payload = buildJwtPayload(auth);
    expect(payload.permissions).toEqual(
      expect.arrayContaining(['users.read', 'rooms.read']),
    );
    expect(hasPermission(payload, 'users.read')).toBe(true);
    expect(hasPermission(payload, 'users.delete')).toBe(false);
  });
});
