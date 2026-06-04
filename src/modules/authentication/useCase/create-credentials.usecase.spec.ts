import { EmailVO } from '../../../shared/valueObject/email.vo';
import { Auth } from '../domain/entities/user.entity';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import { CreateCredentialsUseCase } from './create-credentials.usecase';

const authRepository = {
  create: vi.fn().mockResolvedValue(true),
  findByEmail: vi.fn().mockResolvedValue(
    new Auth(1, new EmailVO('test@test.com'), 'hash'),
  ),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

describe('UseCase: create credentials use case', () => {
  it('should create credentials without assigning roles', async () => {
    const createCredentialsUseCase = new CreateCredentialsUseCase(
      authRepository,
    );
    const credentials = await createCredentialsUseCase.execute({
      email: 'test@test.com',
      password: 'password',
    });

    expect(credentials).toBe(true);
    expect(authRepository.assignRoles).not.toHaveBeenCalled();
  });
});
