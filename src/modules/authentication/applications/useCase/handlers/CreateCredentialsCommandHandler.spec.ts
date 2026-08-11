import { EmailVO } from '@src/shared/valueObject/email.vo';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { CreateCredentialsCommandHandler } from './CreateCredentialsCommandHandler';
import { CreateCredentialsCommand } from '@src/modules/authentication/applications/useCase/commands/CreateCredentialsCommand';

const authRepository = {
  create: vi.fn().mockResolvedValue(true),
  findByEmail: vi
    .fn()
    .mockResolvedValue(new Auth(1, new EmailVO('test@test.com'), 'hash')),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

describe('CreateCredentialsCommandHandler', () => {
  it('should create credentials without assigning roles', async () => {
    const handler = new CreateCredentialsCommandHandler(authRepository);
    const credentials = await handler.execute(
      new CreateCredentialsCommand('test@test.com', 'password'),
    );

    expect(credentials).toBe(true);
    expect(authRepository.assignRoles).not.toHaveBeenCalled();
  });
});
