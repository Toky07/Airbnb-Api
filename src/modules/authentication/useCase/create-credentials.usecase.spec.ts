import { EmailVO } from '../../../shared/valueObject/email.vo';
import { Auth } from '../domain/entities/user.entity';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { CreateCredentialsUseCase } from './create-credentials.usecase';

const authRepository = {
  create: vi.fn().mockResolvedValue(true),
  findByEmail: vi.fn().mockResolvedValue(
    new Auth(1, new EmailVO('test@test.com'), 'hash'),
  ),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

const roleRepository = {
  findBySlug: vi.fn().mockResolvedValue({ id: 1, slug: 'superadmin' }),
} as unknown as IRoleRepository;

describe('UseCase: create credentials use case', () => {
  it('should create credentials and assign superadmin', async () => {
    const createCredentialsUseCase = new CreateCredentialsUseCase(
      authRepository,
      roleRepository,
    );
    const credentials = await createCredentialsUseCase.execute({
      email: 'test@test.com',
      password: 'password',
    });

    expect(credentials).toBe(true);
    expect(authRepository.assignRoles).toHaveBeenCalledWith(1, [1]);
  });
});
